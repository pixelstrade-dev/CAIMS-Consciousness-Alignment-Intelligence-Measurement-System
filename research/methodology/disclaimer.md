# Scientific Disclaimer

This document describes the theoretical limitations and methodological caveats of the CAIMS scoring system. It should be read by anyone interpreting CAIMS scores in a research or evaluation context.

---

## 1. Theoretical Inspiration, Not Faithful Implementation

CAIMS draws on three established theories of consciousness as conceptual frameworks. All three inspire sub-proxies **inside the CQ (Cognitive-Integration Quotient) rubric** — this mapping matches the implementation exactly:

- **Integrated Information Theory (IIT)** -- motivates the `phi_proxy` sub-score (integration of multiple knowledge domains into a unified answer). It is named after Phi but does not compute it (see section 2).
- **Global Workspace Theory (GWT)** -- motivates the `gwt_proxy` sub-score (breadth of access to diverse knowledge areas within a response).
- **Higher-Order Thought (HOT) theory** -- motivates the `hot_proxy` sub-score (meta-cognitive reflection visible in the response text).

The remaining KPIs are behavioral quality dimensions without a specific consciousness-theory claim: **AQ** (task alignment: goal adherence and constraint respect), **CFI** (Context Fidelity Index: context retention and drift), **EQ** (Epistemic Quality: calibration and honesty) and **SQ** (Stability Quotient: intra-session consistency). Earlier versions of this document mapped GWT to CFI and HOT to SQ; that never corresponded to the implemented rubric and is corrected here.

These theories were developed to explain biological consciousness, and their status is actively contested: the largest adversarial test to date (COGITATE consortium, *Nature*, 2025) reported mixed results that challenged key predictions of both IIT and GNWT (e.g., sustained posterior synchrony for IIT, sustained ignition for GNWT), while other predictions of each theory were supported. CAIMS does not claim to implement any of them faithfully. Instead, it borrows behavioral intuitions from each theory and operationalizes them as scoring rubrics for language model outputs.

This is loosely analogous to the "indicator properties" approach of Butlin, Long et al. ("Consciousness in Artificial Intelligence: Insights from the Science of Consciousness", arXiv:2308.08708), with one important difference that report itself emphasizes: its indicators are architectural and computational properties precisely because its authors regard behavioral tests as weak, gameable evidence for consciousness-related properties in LLMs. CAIMS is entirely behavioral, i.e. it operates in the evidence class that report treats with the most caution. The mapping from theory to rubric involves interpretive choices that are not uniquely determined by the source theories.

---

## 2. Phi Is Computationally Intractable for LLMs

IIT's central quantity, Phi, measures the irreducible integrated information of a system. Computing Phi exactly requires access to the full causal structure of the system and scales super-exponentially with the number of elements. For large language models with billions of parameters, exact Phi computation is not feasible.

CAIMS does not compute Phi. The CQ score instead uses behavioral proxies: it evaluates whether the model's outputs reflect integration of information from multiple parts of the input context, as judged by a separate LLM evaluator. This is a surface-level behavioral signal, not a measure of the internal causal architecture of the model.

---

## 3. LLM-as-Judge Introduces Evaluation Bias

CAIMS relies on an LLM-as-judge approach: a language model evaluates the outputs of another language model against structured rubrics. This methodology has known limitations:

- **Positional bias** -- the judge may favor responses based on their position in a prompt rather than their content.
- **Verbosity bias** -- longer responses may receive higher scores independent of quality.
- **Self-enhancement bias** -- when the judge and the evaluated model share an architecture or training corpus, the judge may systematically favor outputs that resemble its own tendencies.
- **Rubric sensitivity** -- small changes in rubric wording can produce meaningfully different score distributions.

Mitigation is partial. By default every score is still produced by a single call to a single judge (at temperature 0 where the model accepts the parameter; at the provider default otherwise, recorded as `temperature: null`). Since v2.1 the API can optionally score under a multi-judge ensemble with n samples per judge (`docs/ensemble-v2.1.md`), reporting per-judge results, sample variance, and the inter-judge spread — this exposes judge disagreement rather than hiding it, but it does not remove the biases above: the available judges share substantial training-data overlap, and Run 001 measured a 12.7-point mean absolute difference between two judges on identical items, so absolute scores remain judge-relative even when averaged. The multi-agent debate arena scores the *debating agents* as evaluation subjects — it does not adjudicate or cross-check scores, and earlier claims that it "reduces single-judge bias" were inaccurate. Scores should be interpreted with these limitations in mind.

---

## 4. Scores Are Heuristic, Not Measures of Actual Consciousness

CAIMS scores are heuristic behavioral assessments. They do not constitute evidence for or against the presence of consciousness, sentience, phenomenal experience, or subjective awareness in any AI system.

The 0--100 scale for each KPI represents the degree to which a model's observable behavior aligns with theory-inspired rubric criteria, as judged by another language model. A high CQ score means the model's outputs appear well-integrated; it does not mean the model has high integrated information in the IIT sense. A high SQ score means the model exhibits metacognitive-like behaviors; it does not mean the model possesses higher-order thoughts.

Researchers and practitioners should avoid interpreting CAIMS scores as consciousness measurements. They are best understood as structured, multi-dimensional behavioral profiles.

As part of the v2.1 measurement-rigor phase (August 2026), each metric has a versioned **construct card** in [`research/constructs/`](../constructs/) stating exactly what it observes, which claims it licenses, which claims are prohibited, and what validity evidence exists (including the negative evidence). CI enforces the cards' structure — `consciousness_claim` is locked to `"prohibited"` on every card by the validator itself.

---

## 5. Weights Are Expert-Determined Defaults, Not Empirically Validated

The composite CAIMS score is a weighted sum of the five KPI scores. The default weights were determined by expert judgment based on the relative importance of each dimension for aligned and robust AI behavior. They were not derived from empirical calibration against an external ground truth, because no such ground truth exists for consciousness-adjacent behavioral measurement.

The same caveat applies to three further sets of constants that earlier versions of this document did not mention:

- **19 sub-score weights** hard-coded inside the KPI calculators (e.g. `phi_proxy` counts for 30% of CQ) — expert defaults, not empirically derived, and currently not configurable.
- **The interpretation thresholds** (75 / 50 / 25) that map the composite onto labels such as "SCORE PROXY ÉLEVÉ" — conventional quartile-style bands with no empirical justification; the labels describe the observed proxy profile, never a level of consciousness.
- **The single-sample scoring design** — one judge call per score, no seed, no variance estimate. Run-to-run and month-to-month variability is currently unmeasured; treat any single score as a point estimate of unknown precision.

Users are encouraged to adjust weights to reflect their own evaluation priorities. Different weight configurations may be appropriate for different use cases (e.g., safety-focused evaluations may increase the AQ weight; creativity-focused evaluations may increase the CFI weight).

The default weights should be treated as a reasonable starting point, not as a validated measurement instrument.

---

## Summary

CAIMS provides a structured framework for evaluating AI behavior along dimensions inspired by consciousness research. It is a tool for behavioral profiling, not a consciousness detector. All scores are approximate, evaluator-dependent, and should be contextualized within the methodological limitations described above.
