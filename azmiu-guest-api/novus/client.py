import logging

import requests

from .exceptions import (
    NovusAPIError,
    NovusConnectionError,
    NovusResponseError,
)

logger = logging.getLogger(__name__)

# Conservative timeout: 10 s connect, 30 s read.
DEFAULT_TIMEOUT = (10, 30)


class NovusClient:
    """Thin HTTP wrapper around the NOVUS REST API."""

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')

    # ── internal helpers ────────────────────────────────────────────

    def _url(self, path: str) -> str:
        return f'{self.base_url}/{path.lstrip("/")}'

    def _request(
        self,
        method: str,
        path: str,
        *,
        token: str | None = None,
        json: dict | None = None,
        params: dict | None = None,
        basic_auth: tuple[str, str] | None = None,
    ) -> dict:
        """
        Execute an HTTP request against NOVUS and return the parsed JSON body.

        Raises typed exceptions for every failure mode so callers never
        need to inspect raw HTTP responses.
        """
        headers = {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',  # Bypass ngrok free tier warning
        }
        if token:
            headers['Authorization'] = f'Bearer {token}'

        url = self._url(path)

        # Intentionally log the path but NEVER the token or credentials.
        logger.info('NOVUS %s %s', method.upper(), path)

        try:
            response = requests.request(
                method,
                url,
                headers=headers,
                json=json,
                params=params,
                auth=basic_auth,  # HTTP Basic Auth (username, password)
                timeout=DEFAULT_TIMEOUT,
            )
        except requests.ConnectionError as exc:
            raise NovusConnectionError(
                f'Failed to connect to NOVUS at {url}'
            ) from exc
        except requests.Timeout as exc:
            raise NovusConnectionError(
                f'NOVUS request timed out: {url}'
            ) from exc

        if not response.ok:
            raise NovusAPIError(
                message=f'NOVUS {method.upper()} {path} returned {response.status_code}',
                status_code=response.status_code,
                detail=_safe_json(response),
            )

        body = _safe_json(response)
        if body is None:
            # Show first 500 chars of response to help debug
            preview = response.text[:500] if response.text else '(empty)'
            raise NovusResponseError(
                f'NOVUS {method.upper()} {path} returned non-JSON body. '
                f'Status: {response.status_code}. Preview: {preview}'
            )
        return body

    # ── public API ──────────────────────────────────────────────────

    def get(self, path: str, *, token: str | None = None, params: dict | None = None) -> dict:
        return self._request('GET', path, token=token, params=params)

    def get_with_basic_auth(
        self, path: str, *, username: str, password: str, params: dict | None = None
    ) -> dict:
        return self._request('GET', path, basic_auth=(username, password), params=params)

    def post(self, path: str, *, token: str | None = None, json: dict | None = None) -> dict:
        return self._request('POST', path, token=token, json=json)


def _safe_json(response: requests.Response) -> dict | None:
    """Return parsed JSON or None if the body is not valid JSON."""
    try:
        return response.json()
    except (ValueError, requests.JSONDecodeError):
        return None
