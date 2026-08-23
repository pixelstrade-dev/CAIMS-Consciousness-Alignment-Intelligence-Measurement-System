"""HTTP client for a CAIMS server. Standard library only — zero dependencies.

Usage::

    from caims import CaimsClient

    client = CaimsClient("http://localhost:3000")
    result = client.score(
        question="Explain how Raft reaches consensus.",
        response="Raft elects a leader; followers replicate its log; ...",
    )
    print(result.composite, result.interpretation.label)
    print(result.provenance.protocol_version)  # never compare across versions
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional, Sequence, Union

from .exceptions import CaimsAPIError, CaimsConnectionError
from .models import Message, ScoreResult

_RETRYABLE_STATUS = {429, 500, 502, 503, 529}


class CaimsClient:
    """Client for the CAIMS REST API.

    Args:
        base_url: root of a running CAIMS server, e.g. ``http://localhost:3000``
            (start one with ``docker compose -f docker-compose.dev.yml up``
            from the repository).
        timeout: per-request timeout in seconds.
        max_retries: retries for retryable statuses (429/5xx) with
            exponential backoff.
        user_agent: sent with every request.
    """

    def __init__(
        self,
        base_url: str,
        *,
        timeout: float = 60.0,
        max_retries: int = 2,
        user_agent: str = "caims-python/2.0.0a1",
    ):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        self.user_agent = user_agent

    # ── public API ────────────────────────────────────────────────────────

    def health(self) -> Dict[str, Any]:
        """GET /api/health — returns the server's health payload."""
        envelope = self._request("GET", "/api/health")
        return envelope.get("data", {})

    def score(
        self,
        *,
        question: str,
        response: str,
        history: Optional[Sequence[Union[Message, Dict[str, str]]]] = None,
    ) -> ScoreResult:
        """POST /api/score — score one question/response interaction.

        Returns a :class:`~caims.models.ScoreResult`. Scores are behavioral
        proxy indicators (0-100), not consciousness measurements; check
        ``result.provenance.protocol_version`` before comparing results
        produced at different times.
        """
        payload: Dict[str, Any] = {"question": question, "response": response}
        msgs: List[Dict[str, str]] = []
        for m in history or []:
            if isinstance(m, Message):
                msgs.append(m.to_api())
            else:
                msgs.append(Message(role=m["role"], content=m["content"]).to_api())
        if msgs:
            payload["history"] = msgs

        envelope = self._request("POST", "/api/score", payload)
        return ScoreResult.from_api(envelope["data"])

    # ── plumbing ──────────────────────────────────────────────────────────

    def _request(
        self, method: str, path: str, body: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        url = self.base_url + path
        data = json.dumps(body).encode("utf-8") if body is not None else None
        headers = {"User-Agent": self.user_agent, "Accept": "application/json"}
        if data is not None:
            headers["Content-Type"] = "application/json"

        last_exc: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                    return self._parse(resp.read(), resp.status)
            except urllib.error.HTTPError as e:
                raw = e.read()
                if e.code in _RETRYABLE_STATUS and attempt < self.max_retries:
                    last_exc = e
                    time.sleep(min(2**attempt, 8))
                    continue
                self._raise_api_error(raw, e.code)
            except (urllib.error.URLError, TimeoutError, OSError) as e:
                if attempt < self.max_retries:
                    last_exc = e
                    time.sleep(min(2**attempt, 8))
                    continue
                raise CaimsConnectionError(f"cannot reach {url}: {e}") from e
        raise CaimsConnectionError(f"cannot reach {url}: {last_exc}")

    @staticmethod
    def _parse(raw: bytes, status: int) -> Dict[str, Any]:
        try:
            envelope = json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError) as e:
            raise CaimsAPIError("INVALID_RESPONSE", f"non-JSON response: {e}", status) from e
        if not isinstance(envelope, dict) or envelope.get("success") is not True:
            CaimsClient._raise_api_error(raw, status)
        return envelope

    @staticmethod
    def _raise_api_error(raw: bytes, status: int) -> None:
        code, message = "UNKNOWN_ERROR", "unrecognized error payload"
        try:
            parsed = json.loads(raw.decode("utf-8"))
            err = parsed.get("error") or {}
            code = str(err.get("code", code))
            message = str(err.get("message", message))
        except (ValueError, UnicodeDecodeError, AttributeError):
            pass
        raise CaimsAPIError(code, message, status)
