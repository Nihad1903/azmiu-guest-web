"""
Custom exceptions for NOVUS external system integration.

All NOVUS-related failures raise typed exceptions so callers
can distinguish between auth errors, API errors, and network issues.
"""


class NovusError(Exception):
    """Base exception for all NOVUS integration failures."""

    def __init__(self, message: str = '', detail: dict | None = None):
        self.detail = detail or {}
        super().__init__(message)


class NovusAuthError(NovusError):
    """Failed to authenticate with NOVUS (bad credentials, expired, etc.)."""


class NovusAPIError(NovusError):
    """NOVUS returned a non-2xx response on a business endpoint."""

    def __init__(
        self,
        message: str = '',
        status_code: int | None = None,
        detail: dict | None = None,
    ):
        self.status_code = status_code
        super().__init__(message, detail)


class NovusConnectionError(NovusError):
    """Network-level failure (timeout, DNS, connection refused)."""


class NovusResponseError(NovusError):
    """NOVUS returned a response that could not be parsed or is missing expected fields."""
