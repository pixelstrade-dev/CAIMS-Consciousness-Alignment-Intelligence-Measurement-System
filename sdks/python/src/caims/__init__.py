"""caims — Python client for the CAIMS behavioral-proxy scoring API.

CAIMS scores consciousness-related BEHAVIORAL PROXY indicators in LLM
interactions (CQ, AQ, CFI, EQ, SQ). A score is never a measurement of
consciousness, sentience or subjective experience:
https://github.com/pixelstrade-dev/CAIMS-Consciousness-Alignment-Intelligence-Measurement-System/blob/main/research/methodology/disclaimer.md
"""

from ._version import __version__
from .client import CaimsClient
from .exceptions import CaimsAPIError, CaimsConnectionError, CaimsError
from .models import (
    ContextAlert,
    Interpretation,
    KPIScore,
    Message,
    Provenance,
    ScoreResult,
)

__all__ = [
    "CaimsClient",
    "CaimsError",
    "CaimsAPIError",
    "CaimsConnectionError",
    "ScoreResult",
    "KPIScore",
    "Interpretation",
    "ContextAlert",
    "Provenance",
    "Message",
    "__version__",
]
