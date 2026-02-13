"""
NOVUS authentication handler.

Authenticates against NOVUS using system-level credentials
(loaded from Django settings / environment) and returns a Bearer token.
"""

import logging

from django.conf import settings

from .client import NovusClient
from .exceptions import NovusAuthError, NovusResponseError

logger = logging.getLogger(__name__)


def authenticate(client: NovusClient) -> str:
    """
    Obtain a Bearer token from NOVUS.

    Uses NOVUS_USERNAME / NOVUS_PASSWORD from Django settings.
    Returns the raw token string.

    Raises:
        NovusAuthError: credentials rejected or missing token in response
        NovusConnectionError: network-level failure (propagated from client)
    """
    username = getattr(settings, 'NOVUS_USERNAME', None)
    password = getattr(settings, 'NOVUS_PASSWORD', None)

    if not username or not password:
        raise NovusAuthError('NOVUS credentials are not configured.')

    try:
        # Authenticate using Basic Auth (username:password in Authorization header)
        data = client.get_with_basic_auth(
            '/api/auth',
            username=username,
            password=password,
        )
    except Exception as exc:
        raise NovusAuthError(f'NOVUS authentication failed: {exc}') from exc

    token = data
    if not token:
        raise NovusResponseError(
            'NOVUS auth response did not contain a token.',
            detail=data if isinstance(data, dict) else {},
        )

    logger.info('Successfully authenticated with NOVUS.')
    return token
