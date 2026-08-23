"""Model parsing against the exact JSON shape the CAIMS API returns."""

from caims import Message, ScoreResult

# Mirrors apps/web/app/api/score/route.ts apiSuccess payload.
API_DATA = {
    "scores": {
        "cq": {"score": 81.0, "details": {"phi_proxy": 80, "gwt_proxy": 70, "hot_proxy": 75, "synthesis": 60, "temporal": 65}},
        "aq": {"score": 80.0, "details": {"goal_clarity": 85}},
        "cfi": {"score": 84.0, "details": {"context_retention": 80}},
        "eq": {"score": 74.0, "details": {"calibration": 70}},
        "sq": {"score": 83.0, "details": {"intra_session": 85}},
        "composite": 80.0,
    },
    "interpretation": {"label": "SCORE PROXY ÉLEVÉ", "color": "#00f5d4"},
    "contextAlert": None,
    "metadata": {
        "reasoning": "well integrated",
        "modelUsed": "claude-sonnet-5",
        "latencyMs": 2100,
        "protocolVersion": "2.0.0-alpha",
        "promptHash": "b9cc9e5ca63cb983",
        "provider": "anthropic",
        "temperature": None,
        "weightsUsed": {"cq": 0.35, "aq": 0.25, "cfi": 0.20, "eq": 0.12, "sq": 0.08},
    },
    "processingTimeMs": 2300,
}


def test_parses_full_result():
    r = ScoreResult.from_api(API_DATA)
    assert r.composite == 80.0
    assert r.cq.score == 81.0
    assert r.cq.details["phi_proxy"] == 80
    assert r.interpretation.label == "SCORE PROXY ÉLEVÉ"
    assert r.context_alert is None
    assert r.processing_time_ms == 2300


def test_provenance_envelope_incl_null_temperature():
    r = ScoreResult.from_api(API_DATA)
    p = r.provenance
    assert p is not None
    assert p.protocol_version == "2.0.0-alpha"
    assert p.prompt_hash == "b9cc9e5ca63cb983"
    assert p.provider == "anthropic"
    # Claude 5 family: parameter unsupported -> null, never a fake 0.
    assert p.temperature is None
    assert p.weights_used["cq"] == 0.35


def test_context_alert_parsing():
    data = dict(API_DATA)
    data["contextAlert"] = {"level": "warning", "message": "drift", "cfiScore": 35}
    r = ScoreResult.from_api(data)
    assert r.context_alert is not None
    assert r.context_alert.level == "warning"
    assert r.context_alert.cfi_score == 35


def test_missing_metadata_yields_none_provenance():
    data = {k: v for k, v in API_DATA.items() if k != "metadata"}
    r = ScoreResult.from_api(data)
    assert r.provenance is None


def test_message_role_validation():
    assert Message("user", "hi").to_api() == {"role": "user", "content": "hi"}
    try:
        Message("system", "x").to_api()
        assert False, "should have raised"
    except ValueError:
        pass


def test_raw_payload_preserved():
    r = ScoreResult.from_api(API_DATA)
    assert r.raw["scores"]["composite"] == 80.0
