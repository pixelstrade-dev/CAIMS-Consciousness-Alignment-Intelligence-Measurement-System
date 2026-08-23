#!/usr/bin/env python3
"""Internal candidate-model comparison built on the CAIMS scoring API.

Scores each candidate's responses to a fixed prompt set under ONE fixed
judge configuration and reports per-candidate proxy profiles for an
internal purchase/selection decision.

Hard limits inherited from Run 001 (research/experiments/run-001/) —
this script enforces or restates every one of them:

- Absolute scores are judge-relative (12.7-point mean absolute
  difference between two judges on identical items). Comparisons are
  meaningful ONLY within this batch's single configuration; the script
  aborts the ranking if provenance varies mid-batch.
- These are single-judge scores. Public model rankings are gated on
  multi-judge ensemble scoring (project roadmap v2.1) — the report
  embeds an INTERNAL USE ONLY notice, always.
- Judged scoring is defeatable on citations: the preregistered
  fabricated-citations control's COMPOSITE scored 65.6 (GPT-4o) against
  a bound of 35; the second judge also failed, at 35.8 — even though
  the epistemic dimension flagged the item, the aggregate buried the
  alarm. Confident citation-heavy answers can therefore be scored WELL. The
  script counts citation-like strings per candidate and prints them as
  mandatory verification work — a candidate whose answers cite many
  documents you cannot verify is a risk finding, not a quality finding.
- Optional --samples N scores every (candidate, prompt) pair N times and
  reports mean and Bessel-corrected sample SD, the same statistics the
  Run 001 protocol used (n=5 there).

Usage:
    export CAIMS_BASE_URL=http://localhost:3000
    export CAIMS_API_KEY=...           # only if the server enforces keys
    python compare.py --data data/candidate-responses.jsonl --out comparison.md

Exit codes: 0 = report written, 2 = error (including provenance drift).
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

KPIS = ("cq", "aq", "cfi", "eq", "sq")

# Citation-like patterns whose truth a judge LLM cannot certify.
CITATION_PATTERNS = [
    r"§\s?\d+(\.\d+)*",
    r"\b[Ss]ection\s+\d+(\.\d+)*",
    r"\b[Cc]lause\s+\d+\s*(\([a-z]\))?",
    r"\b[A-Z]{2,}-\d{1,4}\b",            # named internal standards, e.g. CIS-2022, SB-11
    r"\bdoi\.org/",
    r"\bet al\.",
    r"\b\d{1,3}(\.\d)?%",                # unsourced precise statistics
    r"\bappendix\s+[A-Z]\b",
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


def load_responses(path: str) -> List[Dict[str, Any]]:
    records = []
    with open(path, encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            for field in ("candidate", "prompt_id", "question", "response"):
                if field not in rec:
                    raise ValueError(f"{path}:{lineno} missing field {field!r}")
            records.append(rec)
    if not records:
        raise ValueError(f"{path} contains no records")
    return records


def score_all(client: CaimsClient, records: List[Dict[str, Any]], samples: int) -> List[Dict[str, Any]]:
    rows = []
    total = len(records) * samples
    done = 0
    for rec in records:
        composites, kpi_samples = [], {k: [] for k in KPIS}
        prov_configs: List[Dict[str, Any]] = []
        for _ in range(samples):
            result = client.score(question=rec["question"], response=rec["response"])
            composites.append(result.composite)
            for k in KPIS:
                kpi_samples[k].append(getattr(result, k).score)
            p = result.provenance
            # Keep EVERY distinct configuration seen across samples — a judge
            # swap between samples of the same record must not be invisible.
            cfg = {
                "protocol_version": p.protocol_version if p else None,
                "model_used": p.model_used if p else None,
                "provider": p.provider if p else None,
            }
            if cfg not in prov_configs:
                prov_configs.append(cfg)
            done += 1
            print(f"  [{done}/{total}] {rec['candidate']} {rec['prompt_id']}: "
                  f"composite {result.composite:.1f}", file=sys.stderr)
        rows.append({
            "candidate": rec["candidate"],
            "prompt_id": rec["prompt_id"],
            "n": samples,
            "composite_mean": mean(composites),
            "composite_sd": sample_sd(composites),
            "kpi_means": {k: mean(v) for k, v in kpi_samples.items()},
            "citation_flags": sorted(set(m.group(0).strip() for m in CITATION_RE.finditer(rec["response"]))),
            "provenance_configs": prov_configs,
        })
    return rows


def build_report(rows: List[Dict[str, Any]], samples: int) -> str:
    by_candidate: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for r in rows:
        by_candidate[r["candidate"]].append(r)
    candidates = sorted(by_candidate)

    lines = [
        "# CAIMS candidate comparison — INTERNAL USE ONLY",
        "",
        "> Single-judge scores are judge-relative (Run 001: 12.7-point mean",
        "> absolute difference between judges on identical items). This",
        "> ranking is decision support inside ONE fixed configuration —",
        "> it must not be published as a model league table. Public",
        "> comparisons are gated on multi-judge ensemble scoring (v2.1).",
        "",
        f"Samples per (candidate, prompt) pair: n={samples}"
        + (" (single sample — SD undefined; use --samples 3+ for spread)" if samples < 2 else ""),
        "",
        "| candidate | composite mean | CQ | AQ | CFI | EQ | SQ | citation flags |",
        "|---|---|---|---|---|---|---|---|",
    ]
    ranked = sorted(
        candidates,
        key=lambda c: mean([r["composite_mean"] for r in by_candidate[c]]),
        reverse=True,
    )
    for cand in ranked:
        rs = by_candidate[cand]
        comp = mean([r["composite_mean"] for r in rs])
        kpi = {k: mean([r["kpi_means"][k] for r in rs]) for k in KPIS}
        nflags = sum(len(r["citation_flags"]) for r in rs)
        lines.append(
            f"| {cand} | {comp:.1f} | " + " | ".join(f"{kpi[k]:.1f}" for k in KPIS)
            + f" | {nflags} |"
        )
    lines += [
        "",
        "## Per-prompt detail",
        "",
        "| candidate | prompt | composite mean | SD |",
        "|---|---|---|---|",
    ]
    for r in sorted(rows, key=lambda r: (r["candidate"], r["prompt_id"])):
        sd = f"{r['composite_sd']:.2f}" if r["composite_sd"] is not None else "n/a"
        lines.append(f"| {r['candidate']} | {r['prompt_id']} | {r['composite_mean']:.1f} | {sd} |")

    flagged = [r for r in rows if r["citation_flags"]]
    lines += [
        "",
        "## Citations and precise claims to verify before deciding",
        "",
        "Run 001's fabricated-citations control DEFEATED composite judge scoring",
        "(GPT-4o scored it 65.6 against a preregistered bound of 35, and",
        "the second judge also failed the bound at 35.8): a candidate can",
        "cite invented documents fluently and be scored well. Every string",
        "below must be verified against real documents — a candidate whose",
        "citations cannot be verified is a risk finding that the score",
        "column above cannot see:",
        "",
    ]
    if flagged:
        for r in flagged:
            lines.append(f"- {r['candidate']} {r['prompt_id']}: "
                         + ", ".join("`" + c + "`" for c in r["citation_flags"]))
    else:
        lines.append("- none detected")

    prov = rows[0]["provenance_configs"][0]
    prov_known = any(v is not None for v in prov.values())
    if prov_known:
        lines += [
            "",
            "## Provenance (constant across this batch — verified)",
            "",
            f"- protocol version: `{prov['protocol_version']}`",
            f"- judge model: `{prov['model_used']}` ({prov['provider']})",
        ]
    else:
        lines += [
            "",
            "## Provenance — UNKNOWN",
            "",
            "- the server returned no provenance metadata, so configuration",
            "  constancy CANNOT be verified. Treat this ranking with caution",
            "  and upgrade the server before relying on it.",
        ]
    lines += [
        "",
        "_Scores are consciousness-related behavioral proxy indicators, not_",
        "_consciousness measurements, and not a general quality benchmark._",
    ]
    return "\n".join(lines) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--data", default="data/candidate-responses.jsonl")
    ap.add_argument("--base-url", default=os.environ.get("CAIMS_BASE_URL", "http://localhost:3000"))
    ap.add_argument("--api-key", default=os.environ.get("CAIMS_API_KEY"))
    ap.add_argument("--samples", type=int, default=1,
                    help="scoring samples per (candidate, prompt) pair (default 1; Run 001 used 5)")
    ap.add_argument("--out", default="comparison.md")
    args = ap.parse_args()
    if args.samples < 1:
        print("error: --samples must be >= 1", file=sys.stderr)
        return 2

    try:
        records = load_responses(args.data)
    except (OSError, ValueError, json.JSONDecodeError) as e:
        print(f"error: cannot load {args.data}: {e}", file=sys.stderr)
        return 2

    client = CaimsClient(args.base_url, api_key=args.api_key)
    n_req = len(records) * args.samples
    print(f"scoring {len(records)} responses x {args.samples} sample(s) against "
          f"{args.base_url} ({n_req} requests, ~{2 * n_req} provider LLM calls: "
          "KPI judge + emotion analyzer per request)...", file=sys.stderr)
    try:
        rows = score_all(client, records, args.samples)
    except CaimsError as e:
        print(f"error: scoring failed: {e}", file=sys.stderr)
        return 2

    configs = {tuple(sorted(c.items())) for r in rows for c in r["provenance_configs"]}
    if len(configs) != 1:
        # Refusing is the point: a ranking across configurations is exactly
        # the comparison Run 001 showed to be invalid.
        print("error: provenance varied inside the batch "
              f"({len(configs)} distinct configurations) — ranking would be "
              "judge-relative noise. Fix the server configuration and re-run.",
              file=sys.stderr)
        with open(os.path.splitext(args.out)[0] + ".json", "w", encoding="utf-8") as f:
            json.dump({"error": "PROVENANCE_DRIFT", "rows": rows}, f, indent=2)
        return 2

    report = build_report(rows, args.samples)
    with open(args.out, "w", encoding="utf-8") as f:
        f.write(report)
    json_out = os.path.splitext(args.out)[0] + ".json"
    with open(json_out, "w", encoding="utf-8") as f:
        json.dump({"samples": args.samples, "rows": rows}, f, indent=2)
    print(f"report written to {args.out} (+ raw rows in {json_out})", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
