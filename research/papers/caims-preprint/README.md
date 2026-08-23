# CAIMS preprint — build & submission checklist

Status: **DRAFT v0.1 — not yet compiled in this environment (no TeX
toolchain available here), not yet submitted anywhere.** Every number in
the manuscript is taken from the committed Run 001 artifacts
(`research/experiments/run-001/results/summary.json` and `REPORT.md`);
verify against them after any re-run.

## Compile (owner machine)

```bash
cd research/papers/caims-preprint
pdflatex main.tex && pdflatex main.tex   # twice for references
# or: tectonic main.tex
```

Standard `article` class + `booktabs`/`hyperref` only — any TeX Live or
Overleaf (paste `main.tex` into a new Overleaf project) will build it.

## Before submission — verification gates (do not skip)

1. Re-read every number against `summary.json` (the source of truth).
2. Verify the four references resolve exactly as cited:
   - Cogitate Consortium, *Nature* 642 (2025) — check volume/pages on nature.com
   - arXiv:2308.08708 — author list is long; the manuscript lists it in
     full, cross-check against the arXiv page before submitting
   - arXiv:2306.05685 (Zheng et al., MT-Bench)
   - transformer-circuits.pub emotions paper (2026) — confirm exact title
3. Insert the Zenodo DOI in the Data Availability section once minted.
4. Decide the arXiv category: `cs.CL` (primary) with `cs.AI` cross-list
   is the natural fit.

## Submitting to arXiv (owner actions — account required)

1. Create/log into an account at https://arxiv.org (institutional email
   helps; first-time submitters in a category may need an *endorsement* —
   arXiv shows the request flow automatically if so).
2. New submission → upload `main.tex` (arXiv compiles TeX itself) →
   choose license (recommend CC BY 4.0, consistent with the project's
   open posture) → category `cs.CL`.
3. Abstract: paste from the manuscript.
4. After the announcement, add the arXiv ID to README.md and CITATION.cff.

## Honesty notes baked into the manuscript (do not remove)

- "What CAIMS does not claim" paragraph in the introduction.
- The Claude-authored-controls confound, stated before any judge
  comparison is interpreted.
- AI-assistance acknowledgment (arXiv moderation increasingly expects
  disclosure; it is also simply true).
- Failures (4/12 control cells) reported in the abstract itself.
