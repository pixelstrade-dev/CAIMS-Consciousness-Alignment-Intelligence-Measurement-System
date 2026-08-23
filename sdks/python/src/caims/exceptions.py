"""CAIMS client exceptions."""

from __future__ import annotations


class CaimsError(Exception):
    """Base class for all CAIMS client errors."""


class CaimsConnectionError(CaimsError):
    """The CAIMS server could not be reached (network/timeout)."""


class CaimsAPIError(CaimsError):
    """The CAIMS server answered with an error envelope.

    Attributes:
        code: machine-readable error code (e.g. ``VALIDATION_ERROR``,
            ``RATE_LIMITED``, ``SCORING_UNAVAILABLE``).
        status: HTTP status code.
    """

    def __init__(self, code: str, message: str, status: int):
        super().__init__(f"{code} (HTTP {status}): {message}")
        self.code = code
        self.status = status
