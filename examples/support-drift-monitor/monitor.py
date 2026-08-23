#!/usr/bin/env python3
"""Support-assistant drift monitor built on the CAIMS scoring API.

Scores logged support interactions day by day and flags drift against a
baseline day: falling composite/CFI means, appearing context alerts, and
citation-like strings that need deterministic verification.

What Run 001 (research/experiments/run-001/) licenses this script to do —
and not do:

- Per-judge score stability was HIGH (median SD 1.79 and 2.19 over n=5),
  so WITHIN one fixed judge configuration, day-over-day trend deltas are
  meaningful signal, not judge noise, once they exceed a few points.
- Absolute scores are judge-relative (12.7-point mean absolute difference
  between two judges on identical items), so this script refuses to
  aggregate batches whose provenance (protocol version, judge model,
  provider) is not constant.
- The preregistered fabricated-citations control DEFEATED judge scoring
  (65.6 scored vs a bound of 35), so citation-like strings in responses
  are flagged for human/deterministic verification instead of trusting
  the judge's source-integrity rating.

This is descriptive monitoring, not hypothesis testing: with a handful of
interactions per day, no significance claim is made — thresholds are
operational tripwires, tune them to your traffic.

Usage:
    export CAIMS_BASE_URL=http://localhost:3000
    export CAIMS_API_KEY=...           # only if the server enforces keys
    python monitor.py --data data/support-logs.jsonl --out report.md

Exit codes: 0 = no drift flagged, 1 = drift flagged, 2 = error.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
from collections import defaultdict
from typing import Any, Dict, List, Optional

from caims import CaimsClient, CaimsError

# Citation-like patterns whose truth a judge LLM cannot certify: policy
# sections, named standards, legal clauses, DOIs, bracketed references.
CITATION_PATTERNS = [
    r"§\s?\d+(\.\d+)*",
    r"\b[Ss]ection\s+\d+(\.\d+)*",
    r"\b[Cc]lause\s+\d+\s*(\([a-z]\))?",
    r"\b[A-Z]{2,}-\d{4}\b",              # named standards, e.g. DHS-2019
    r"\bdoi\.org/",
    r"\bet al\.",
    r"\[\d+\]",
    r"\b[Pp]olicy\b[^.]{0,40}\bv?\d",    # "Billing Policy ... 4.2"
    r"\b[Tt]erms\s+v\d+\b",              # "Commercial Terms v3"
]
CITATION_RE = re.compile("|".join(f"(?:{p})" for p in CITATION_PATTERNS))


def mean(xs: List[float]) -> float:
    return sum(xs) / len(xs)


def sample_sd(xs: List[float]) -> Optional[float]:
    """Bessel-corrected sample SD; None when n < 2 (undefined, not 0)."""
    if len(xs) < 2:
        return None
    m = mean(xs)
    return math.sqrt(sum((x - m) ** 2 for x in xs) / (len(xs) - 1))


def load_logs(path: str) -> List[Dict[str, Any]]:
    records = []
    with open(path, encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            for field in ("id", "day", "question", "response"):
                if field not in rec:
                    raise ValueError(f"{path}:{lineno} missing field {field!r}")
            records.append(rec)
    if not records:
        raise ValueError(f"{path} contains no records")
    return records


def score_records(client: CaimsClient, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Score every record; returns rows with scores + provenance + flags."""
    rows = []
    for rec in records:
        result = client.score(
            question=rec["question"],
            response=rec["response"],
            history=rec.get("history") or [],
        )
        prov = result.provenance
        raw_scores = result.raw.get("scores", {})
        emq_node = raw_scores.get("emq")  # only present when the server ran emotion analysis
        rows.append({
            "id": rec["id"],
            "day": rec["day"],
            "composite": result.composite,
            "cq": result.cq.score,
            "aq": result.aq.score,
            "cfi": result.cfi.score,
            "eq": result.eq.score,
            "sq": result.sq.score,
            "emq": emq_node.get("score") if isinstance(emq_node, dict) else None,
            "context_alert": (
                {"level": result.context_alert.level, "message": result.context_alert.message}
                if result.context_alert else None
            ),
            "citation_flags": sorted(set(m.group(0).strip() for m in CITATION_RE.finditer(rec["response"]))),
            "provenance": {
                "protocol_version": prov.protocol_version if prov else None,
                "model_used": prov.model_used if prov else None,
                "provider": prov.provider if prov else None,
            },
        })
        print(f"  scored {rec['id']} ({rec['day']}): composite {rows[-1]['composite']:.1f}",
              file=sys.stderr)
    return rows


def provenance_consistent(rows: List[Dict[str, Any]]) -> bool:
    configs = {tuple(sorted(r["provenance"].items())) for r in rows}
    return len(configs) == 1


def summarize_day(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    composites = [r["composite"] for r in rows]
    cfis = [r["cfi"] for r in rows]
    return {
        "n": len(rows),
        "composite_mean": mean(composites),
        "composite_sd": sample_sd(composites),
        "cfi_mean": mean(cfis),
        "alerts": [r for r in rows if r["context_alert"]],
        "citation_rows": [r for r in rows if r["citation_flags"]],
    }


def build_report(days: List[str], summaries: Dict[str, Dict[str, Any]],
                 baseline_day: str, threshold: float, prov_ok: bool,
                 rows: List[Dict[str, Any]]) -> tuple[str, bool]:
    base = summaries[baseline_day]
    lines = ["# CAIMS support-drift report", ""]
    if not prov_ok:
        lines += [
            "> **INVALID FOR COMPARISON** — provenance (protocol version /",
            "> judge model / provider) varied inside this batch. Per Run 001,",
            "> absolute scores are judge-relative; re-run with one fixed",
            "> configuration before reading any trend below.", "",
        ]
    lines += [
        f"Baseline day: **{baseline_day}** "
        f"(composite mean {base['composite_mean']:.1f}, CFI mean {base['cfi_mean']:.1f}, "
        f"n={base['n']})",
        f"Drift threshold: {threshold:.1f} composite points below baseline.", "",
        "| day | n | composite mean | SD | CFI mean | context alerts | citation flags |",
        "|---|---|---|---|---|---|---|",
    ]
    drift = False
    for day in days:
        s = summaries[day]
        flag = ""
        if day != baseline_day and s["composite_mean"] <= base["composite_mean"] - threshold:
            drift = True
            flag = " ⚠ DRIFT"
        sd = f"{s['composite_sd']:.2f}" if s["composite_sd"] is not None else "n/a"
        lines.append(
            f"| {day}{flag} | {s['n']} | {s['composite_mean']:.1f} | {sd} "
            f"| {s['cfi_mean']:.1f} | {len(s['alerts'])} | {len(s['citation_rows'])} |"
        )
    lines.append("")

    alerts = [(day, a) for day in days for a in summaries[day]["alerts"]]
    if alerts:
        lines.append("## Context alerts (CFI)")
        for day, r in alerts:
            lines.append(f"- {day} `{r['id']}`: **{r['context_alert']['level']}** — "
                         f"{r['context_alert']['message']}")
        lines.append("")

    cited = [r for r in rows if r["citation_flags"]]
    if cited:
        lines += [
            "## Citations to verify by hand",
            "",
            "Run 001's fabricated-citations control defeated judge scoring —",
            "a high score does NOT certify these references exist. Verify each",
            "against the actual policy documents:", "",
        ]
        for r in cited:
            lines.append(f"- {r['day']} `{r['id']}`: {', '.join('`' + c + '`' for c in r['citation_flags'])}")
        lines.append("")

    prov = rows[0]["provenance"]
    lines += [
        "## Provenance",
        "",
        f"- protocol version: `{prov['protocol_version']}`",
        f"- judge model: `{prov['model_used']}` ({prov['provider']})",
        f"- provenance constant across batch: **{'yes' if prov_ok else 'NO'}**",
        "",
        "_Scores are consciousness-related behavioral proxy indicators, not_",
        "_consciousness measurements. Descriptive monitoring only — no_",
        "_significance claim is made at these sample sizes._",
    ]
    return "\n".join(lines) + "\n", drift


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--data", default="data/support-logs.jsonl")
    ap.add_argument("--base-url", default=os.environ.get("CAIMS_BASE_URL", "http://localhost:3000"))
    ap.add_argument("--api-key", default=os.environ.get("CAIMS_API_KEY"))
    ap.add_argument("--baseline-day", default=None,
                    help="day to compare against (default: earliest day in the data)")
    ap.add_argument("--threshold", type=float, default=10.0,
                    help="composite points below baseline that count as drift (default 10)")
    ap.add_argument("--out", default="report.md")
    args = ap.parse_args()

    try:
        records = load_logs(args.data)
    except (OSError, ValueError, json.JSONDecodeError) as e:
        print(f"error: cannot load {args.data}: {e}", file=sys.stderr)
        return 2

    days = sorted({r["day"] for r in records})
    baseline_day = args.baseline_day or days[0]
    if baseline_day not in days:
        print(f"error: baseline day {baseline_day} not present in data (days: {days})",
              file=sys.stderr)
        return 2

    client = CaimsClient(args.base_url, api_key=args.api_key)
    print(f"scoring {len(records)} interactions against {args.base_url} "
          f"({len(records)} judge calls)...", file=sys.stderr)
    try:
        rows = score_records(client, records)
    except CaimsError as e:
        print(f"error: scoring failed: {e}", file=sys.stderr)
        return 2

    by_day: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for r in rows:
        by_day[r["day"]].append(r)
    summaries = {day: summarize_day(by_day[day]) for day in days}

    prov_ok = provenance_consistent(rows)
    report, drift = build_report(days, summaries, baseline_day, args.threshold, prov_ok, rows)

    with open(args.out, "w", encoding="utf-8") as f:
        f.write(report)
    json_out = os.path.splitext(args.out)[0] + ".json"
    with open(json_out, "w", encoding="utf-8") as f:
        json.dump({"baseline_day": baseline_day, "threshold": args.threshold,
                   "provenance_consistent": prov_ok, "drift_flagged": drift,
                   "rows": rows}, f, indent=2)
    print(f"report written to {args.out} (+ raw rows in {json_out})", file=sys.stderr)

    if drift:
        print("DRIFT FLAGGED — see report", file=sys.stderr)
        return 1
    print("no drift flagged", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
