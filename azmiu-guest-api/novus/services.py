"""
NOVUS business-logic service layer.

Contains individual API operations (create user, create card, create credential)
and the orchestrator that ties them together in the correct order for QR generation.

This module is the ONLY place that knows about the NOVUS workflow sequence.
Views and serializers call `provision_qr_for_request()` — nothing else.
"""

import logging
import uuid
from datetime import datetime, timedelta, timezone

from django.conf import settings

from .auth import authenticate
from .client import NovusClient
from .exceptions import NovusResponseError

logger = logging.getLogger(__name__)

# Default QR validity period (days from now).
QR_VALIDITY_DAYS = 365


# ── Individual NOVUS operations ────────────────────────────────────


def create_guest_user(
    client: NovusClient,
    token: str,
    *,
    first_name: str,
    last_name: str,
    email: str,
    remark: str = '',
) -> int:
    """
    POST /api/Users — create a guest user in NOVUS.

    Returns the NOVUS user ID (int).
    """
    payload = {
        'firstName': first_name,
        'lastName': last_name,
        'email': email,
        'remark': remark,
        'male': True,
        'type': 'Guest',
    }
    data = client.post('/api/Users', token=token, json=payload)

    user_id = data.get('id')
    if user_id is None:
        raise NovusResponseError(
            'NOVUS create-user response missing "id".',
            detail=data,
        )
    logger.info('NOVUS guest user created: %s', user_id)
    return int(user_id)


def create_qr_card(
    client: NovusClient,
    token: str,
    *,
    qr_number: str,
) -> tuple[int, str]:
    """
    POST /api/Cards — create a QR card in NOVUS.

    Returns (novus_card_id, qr_number).
    The returned qr_number may differ from the one we sent
    (NOVUS may normalise it), so always use the response value.
    """
    payload = {
        'number': qr_number,
        'type': 'QRCode',
        'cardFormatId': 0,
        'remark': '',
        'cardPresentationId': 0,
        'id': 0,
    }
    data = client.post('/api/Cards', token=token, json=payload)

    card_id = data.get('id')
    actual_number = data.get('number')
    if card_id is None or actual_number is None:
        raise NovusResponseError(
            'NOVUS create-card response missing "id" or "number".',
            detail=data,
        )
    logger.info('NOVUS QR card created: id=%s number=%s', card_id, actual_number)
    return int(card_id), str(actual_number)


def create_credential(
    client: NovusClient,
    token: str,
    *,
    novus_user_id: int,
    novus_card_id: int,
    expiration_date: str | None = None,
) -> int:
    """
    POST /api/Credentials — link a card to a user in NOVUS.

    Returns the NOVUS credential ID (int).
    """
    if expiration_date is None:
        expiration_date = (
            datetime.now(timezone.utc) + timedelta(days=QR_VALIDITY_DAYS)
        ).isoformat()

    access_level = getattr(settings, 'NOVUS_ACCESS_LEVEL', 16002)

    payload = {
        'accessLevel': access_level,
        'userId': novus_user_id,
        'expirationDate': expiration_date,
        'cards': [novus_card_id],
        'vehicles': [],
        'qrCodes': [novus_card_id],
    }
    data = client.post('/api/Credentials', token=token, json=payload)

    credential_id = data.get('id')
    if credential_id is None:
        raise NovusResponseError(
            'NOVUS create-credential response missing "id".',
            detail=data,
        )
    logger.info('NOVUS credential created: %s', credential_id)
    return int(credential_id)


# ── Orchestrator ───────────────────────────────────────────────────


def _generate_qr_number() -> str:
    """Generate a unique QR number (6-digit numeric string)."""
    return str(uuid.uuid4().int)[:6]


def provision_qr_for_request(qr_request) -> None:
    """
    Execute the full NOVUS QR provisioning flow for an approved GuestQRRequest.

    Sequence:
        1. Authenticate with NOVUS
        2. Create NOVUS guest user
        3. Create QR card
        4. Create credential (link user + card)
        5. Persist all NOVUS IDs back into qr_request

    On success, the qr_request instance will have its NOVUS fields populated
    (novus_user_id, novus_card_id, novus_credential_id, qr_number)
    and be saved to the database.

    On failure, any NovusError propagates upward so the caller can roll
    back the DB transaction.
    """
    base_url = getattr(settings, 'NOVUS_BASE_URL', None)

    if not base_url:
        raise NovusResponseError('NOVUS_BASE_URL is not configured.')

    client = NovusClient(base_url)

    # Step 1: Auth
    token = authenticate(client)
    # Step 2: Create guest user
    novus_user_id = create_guest_user(
        client,
        token,
        first_name=qr_request.guest_name,
        last_name=qr_request.guest_surname,
        email=qr_request.guest_email,
        remark=qr_request.remark or '',
    )

    # Step 3: Create QR card
    qr_number = _generate_qr_number()
    novus_card_id, actual_qr_number = create_qr_card(
        client,
        token,
        qr_number=qr_number,
    )

    # Step 4: Create credential (link user + card)
    novus_credential_id = create_credential(
        client,
        token,
        novus_user_id=novus_user_id,
        novus_card_id=novus_card_id,
    )

    # Step 5: Persist NOVUS IDs
    qr_request.novus_user_id = str(novus_user_id)
    qr_request.novus_card_id = str(novus_card_id)
    qr_request.novus_credential_id = str(novus_credential_id)
    qr_request.qr_number = str(actual_qr_number)
    qr_request.save(update_fields=[
        'novus_user_id',
        'novus_card_id',
        'novus_credential_id',
        'qr_number',
        'updated_at',
    ])

    logger.info(
        'NOVUS provisioning complete for QR request %s '
        '(user=%s, card=%s, credential=%s, qr=%s)',
        qr_request.pk,
        novus_user_id,
        novus_card_id,
        novus_credential_id,
        actual_qr_number,
    )
