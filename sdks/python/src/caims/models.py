"""Typed models mirroring the CAIMS API response shapes.

CAIMS scores are consciousness-related BEHAVIORAL PROXY indicators — never
measurements of consciousness, sentience or subjective experience. See the
repository's research/methodology/disclaimer.md before interpreting values.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class KPIScore:
    """One KPI: its 0-100 score and the judge's sub-score details."""

    score: float
    details: Dict[str, float] = field(default_factory=dict)


@dataclass(frozen=True)
class Interpretation:
    """Proxy-profile band for a composite score (e.g. 'SCORE PROXY ÉLEVÉ')."""

    label: str
    color: str


@dataclass(frozen=True)
class ContextAlert:
    """Raised by the server when CFI indicates context drift."""

    level: str  # "warning" | "critical"
    message: str
    cfi_score: float


@dataclass(frozen=True)
class Provenance:
    """Methodology provenance attached to a score.

    Scores with different ``protocol_version`` values must never be
    compared silently. ``temperature`` is ``None`` when the judge model
    rejects the parameter (e.g. the Claude 5 family) and sampling ran at
    the provider default.
    """

    reasoning: Optional[str] = None
    model_used: Optional[str] = None
    latency_ms: Optional[float] = None
    protocol_version: Optional[str] = None
    prompt_hash: Optional[str] = None
    provider: Optional[str] = None
    temperature: Optional[float] = None
    weights_used: Optional[Dict[str, float]] = None


@dataclass(frozen=True)
class ScoreResult:
    """Full result of a /api/score call."""

    cq: KPIScore
    aq: KPIScore
    cfi: KPIScore
    eq: KPIScore
    sq: KPIScore
    composite: float
    interpretation: Interpretation
    context_alert: Optional[ContextAlert]
    provenance: Optional[Provenance]
    processing_time_ms: Optional[float]
    raw: Dict[str, Any] = field(repr=False, default_factory=dict)

    @staticmethod
    def from_api(data: Dict[str, Any]) -> "ScoreResult":
        """Build a ScoreResult from the ``data`` field of the API envelope."""
        scores = data["scores"]

        def kpi(name: str) -> KPIScore:
            node = scores[name]
            return KPIScore(score=float(node["score"]), details=dict(node.get("details") or {}))

        interp = data.get("interpretation") or {}
        alert_node = data.get("contextAlert")
        alert = (
            ContextAlert(
                level=str(alert_node["level"]),
                message=str(alert_node["message"]),
                cfi_score=float(alert_node["cfiScore"]),
            )
            if alert_node
            else None
        )

        meta_node = data.get("metadata")
        provenance = (
            Provenance(
                reasoning=meta_node.get("reasoning"),
                model_used=meta_node.get("modelUsed"),
                latency_ms=meta_node.get("latencyMs"),
                protocol_version=meta_node.get("protocolVersion"),
                prompt_hash=meta_node.get("promptHash"),
                provider=meta_node.get("provider"),
                temperature=meta_node.get("temperature"),
                weights_used=meta_node.get("weightsUsed"),
            )
            if isinstance(meta_node, dict)
            else None
        )

        return ScoreResult(
            cq=kpi("cq"),
            aq=kpi("aq"),
            cfi=kpi("cfi"),
            eq=kpi("eq"),
            sq=kpi("sq"),
            composite=float(scores["composite"]),
            interpretation=Interpretation(
                label=str(interp.get("label", "")), color=str(interp.get("color", ""))
            ),
            context_alert=alert,
            provenance=provenance,
            processing_time_ms=data.get("processingTimeMs"),
            raw=data,
        )


@dataclass(frozen=True)
class Message:
    """One turn of prior conversation history."""

    role: str  # "user" | "assistant"
    content: str

    def to_api(self) -> Dict[str, str]:
        if self.role not in ("user", "assistant"):
            raise ValueError(f"role must be 'user' or 'assistant', got {self.role!r}")
        return {"role": self.role, "content": self.content}
