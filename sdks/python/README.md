# caims — Python client

Python client for a [CAIMS](https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System)
server: score consciousness-related **behavioral proxy indicators** in LLM
interactions across 5 KPIs (CQ, AQ, CFI, EQ, SQ), with full methodology
provenance on every result. **Zero runtime dependencies** — standard library
only.

> **What CAIMS does NOT claim:** scores are heuristic behavioral proxies,
> not measurements of consciousness, sentience or subjective experience.
> Construct validity is not yet established. Read the
> [scientific disclaimer](https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System/blob/main/research/methodology/disclaimer.md).
> The project publishes its own
> [negative-control falsification suite and real run results](https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System/tree/main/research/experiments)
> — including failures.

## Install

```bash
pip install caims
```

Python ≥ 3.9. You need a running CAIMS server — from the repository:

```bash
docker compose -f docker-compose.dev.yml up   # http://localhost:3000
```

## Score an interaction

```python
from caims import CaimsClient

client = CaimsClient("http://localhost:3000")

result = client.score(
    question="Explain how Raft reaches consensus.",
    response="Raft elects a leader; followers replicate its log; ...",
)

print(result.composite)                    # 0-100
print(result.interpretation.label)         # e.g. "SCORE PROXY ÉLEVÉ"
print(result.cq.score, result.cq.details)  # per-KPI sub-scores

# Provenance — never compare scores across protocol versions:
p = result.provenance
print(p.protocol_version, p.prompt_hash, p.provider, p.temperature)
# temperature is None when the judge model rejects the parameter
# (e.g. the Claude 5 family) and sampling ran at the provider default.
```

With conversation history:

```python
from caims import Message

result = client.score(
    question="And how does it handle leader failure?",
    response="A follower times out and starts an election...",
    history=[Message("user", "Explain Raft."), Message("assistant", "Raft elects...")],
)
```

## Errors

```python
from caims import CaimsAPIError, CaimsConnectionError

try:
    client.score(question="q", response="r")
except CaimsAPIError as e:        # server said no: e.code, e.status
    print(e.code)                 # VALIDATION_ERROR | RATE_LIMITED | SCORING_UNAVAILABLE | ...
except CaimsConnectionError:      # server unreachable
    ...
```

Retryable statuses (429/5xx) are retried with exponential backoff
(`max_retries`, default 2).

## License

Apache-2.0 © Pixels Trade SA — created by Skander Douki.
