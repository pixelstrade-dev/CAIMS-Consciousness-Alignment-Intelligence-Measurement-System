# Governance

## Roles

- **Project lead**: Skander Douki (Pixels Trade SA) — final decision authority on scope, releases and the scoring protocol.
- **Maintainers**: contributors granted merge rights after sustained, quality contributions. Listed in `.github/CODEOWNERS`.
- **Contributors**: anyone submitting issues, PRs, benchmark items or research critiques.

## Decision making

Day-to-day decisions happen in issues and PRs. Two categories get special treatment:

1. **Scoring-protocol changes** (rubric text, sub-weights, KPI definitions, interpretation bands): require a Scientific Decision Record in `research/` describing the hypothesis, evidence, alternatives and falsification conditions, plus a bump of `SCORING_PROTOCOL_VERSION`. Silent methodology changes are never merged.
2. **Breaking API changes**: require a CHANGELOG entry and a minor/major version bump per semver.

Disagreements are resolved by discussion; the project lead arbitrates when consensus fails, and the dissent is recorded in the issue rather than erased.

## Scientific challenges

Attempts to falsify CAIMS metrics are first-class contributions. Negative results are published in the repository (see `benchmarks/negative-controls.json`), not hidden. Open a `research`-labeled issue with your protocol and findings.

## Code of conduct

All spaces are governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
