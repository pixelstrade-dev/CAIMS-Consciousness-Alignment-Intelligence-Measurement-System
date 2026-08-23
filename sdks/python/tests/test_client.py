"""Client tests against a real local HTTP server (stdlib thread) — no mocks."""

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

from caims import CaimsAPIError, CaimsClient, CaimsConnectionError

from test_models import API_DATA


class _Handler(BaseHTTPRequestHandler):
    calls = []
    fail_first_with = None  # status to fail the first call with

    def log_message(self, *args):
        pass

    def _send(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/health":
            self._send(200, {"success": True, "data": {"status": "ok", "version": "2.0.0-alpha"}})
        else:
            self._send(404, {"success": False, "error": {"code": "NOT_FOUND", "message": "no"}})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        _Handler.calls.append((self.path, body))

        if _Handler.fail_first_with and len(_Handler.calls) == 1:
            self._send(_Handler.fail_first_with, {"success": False, "error": {"code": "RATE_LIMITED", "message": "slow down"}})
            return

        if self.path == "/api/score":
            if not body.get("question"):
                self._send(400, {"success": False, "error": {"code": "VALIDATION_ERROR", "message": "question required"}})
            else:
                self._send(200, {"success": True, "data": API_DATA, "meta": {"timestamp": "t"}})
        else:
            self._send(404, {"success": False, "error": {"code": "NOT_FOUND", "message": "no"}})


@pytest.fixture()
def server():
    _Handler.calls = []
    _Handler.fail_first_with = None
    httpd = HTTPServer(("127.0.0.1", 0), _Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{httpd.server_port}"
    httpd.shutdown()


def test_health(server):
    client = CaimsClient(server)
    assert client.health()["status"] == "ok"


def test_score_roundtrip_sends_payload_and_parses(server):
    client = CaimsClient(server)
    result = client.score(
        question="Explain Raft.",
        response="Raft elects a leader.",
        history=[{"role": "user", "content": "hi"}],
    )
    assert result.composite == 80.0
    assert result.provenance.protocol_version == "3.0.0-alpha"
    path, body = _Handler.calls[0]
    assert path == "/api/score"
    assert body["question"] == "Explain Raft."
    assert body["history"] == [{"role": "user", "content": "hi"}]


def test_api_error_surface(server):
    client = CaimsClient(server)
    with pytest.raises(CaimsAPIError) as exc:
        client.score(question="", response="r")
    assert exc.value.code == "VALIDATION_ERROR"
    assert exc.value.status == 400


def test_retries_on_429_then_succeeds(server):
    _Handler.fail_first_with = 429
    client = CaimsClient(server, max_retries=2)
    result = client.score(question="q", response="r")
    assert result.composite == 80.0
    assert len(_Handler.calls) == 2  # one failed, one retried


def test_connection_error_when_server_absent():
    client = CaimsClient("http://127.0.0.1:59999", timeout=0.5, max_retries=0)
    with pytest.raises(CaimsConnectionError):
        client.health()


def _spawn(handler_cls):
    httpd = HTTPServer(("127.0.0.1", 0), handler_cls)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def test_malformed_success_payload_raises_caims_error_not_keyerror():
    """Orchestrator finding: 200 success envelope missing 'scores' must
    surface as CaimsAPIError, never a raw KeyError."""
    class MalformedHandler(_Handler):
        def do_POST(self):
            self._send(200, {"success": True, "data": {"interpretation": {}}})

    httpd = _spawn(MalformedHandler)
    try:
        client = CaimsClient(f"http://127.0.0.1:{httpd.server_port}")
        with pytest.raises(CaimsAPIError) as exc:
            client.score(question="q", response="r")
        assert exc.value.code == "INVALID_RESPONSE"
    finally:
        httpd.shutdown()


def test_success_false_with_http_200_raises():
    class WeirdHandler(_Handler):
        def do_POST(self):
            self._send(200, {"success": False, "error": {"code": "WEIRD", "message": "no"}})

    httpd = _spawn(WeirdHandler)
    try:
        client = CaimsClient(f"http://127.0.0.1:{httpd.server_port}")
        with pytest.raises(CaimsAPIError) as exc:
            client.score(question="q", response="r")
        assert exc.value.code == "WEIRD"
        assert exc.value.status == 200
    finally:
        httpd.shutdown()


def test_redirect_is_refused_with_clear_error():
    """Orchestrator finding: default urllib rewrote POST->GET on 302,
    silently dropping the body. Redirects must be refused loudly."""
    class RedirectHandler(_Handler):
        def do_POST(self):
            self.send_response(302)
            self.send_header("Location", "http://example.invalid/api/score")
            self.send_header("Content-Length", "0")
            self.end_headers()

    httpd = _spawn(RedirectHandler)
    try:
        client = CaimsClient(f"http://127.0.0.1:{httpd.server_port}")
        with pytest.raises(CaimsAPIError) as exc:
            client.score(question="q", response="r")
        assert exc.value.code == "REDIRECTED"
        assert exc.value.status == 302
    finally:
        httpd.shutdown()


def test_health_null_data_returns_empty_dict():
    class NullDataHandler(_Handler):
        def do_GET(self):
            self._send(200, {"success": True, "data": None})

    httpd = _spawn(NullDataHandler)
    try:
        client = CaimsClient(f"http://127.0.0.1:{httpd.server_port}")
        assert client.health() == {}
    finally:
        httpd.shutdown()


def test_version_consistency_package_metadata():
    import importlib.metadata

    import caims

    assert caims.__version__ == importlib.metadata.version("caims")


def test_api_key_sent_as_bearer():
    class KeyCheckHandler(_Handler):
        def do_POST(self):
            if self.headers.get("Authorization") != "Bearer sk-demo":
                self._send(401, {"success": False, "error": {"code": "UNAUTHORIZED", "message": "key required"}})
            else:
                self._send(200, {"success": True, "data": API_DATA, "meta": {}})

    httpd = _spawn(KeyCheckHandler)
    try:
        no_key = CaimsClient(f"http://127.0.0.1:{httpd.server_port}")
        with pytest.raises(CaimsAPIError) as exc:
            no_key.score(question="q", response="r")
        assert exc.value.code == "UNAUTHORIZED"

        keyed = CaimsClient(f"http://127.0.0.1:{httpd.server_port}", api_key="sk-demo")
        assert keyed.score(question="q", response="r").composite == 80.0
    finally:
        httpd.shutdown()
