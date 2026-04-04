# Scientific Disclaimer

This document describes the theoretical limitations and methodological caveats of the CAIMS scoring system. It should be read by anyone interpreting CAIMS scores in a research or evaluation context.

---

## 1. Theoretical Inspiration, Not Faithful Implementation

CAIMS draws on three established theories of consciousness as conceptual frameworks:

- **Integrated Information Theory (IIT)** -- provides the motivation for measuring information integration across context (CQ).
- **Global Workspace Theory (GWT)** -- inspires the Cognitive Flexibility Index (CFI), which assesses a model's ability to broadcast and recombine information across reasoning strategies.
- **Higher-Order Thought (HOT) theory** -- informs the Self-awareness Quotient (SQ), which probes metacognitive behaviors such as uncertainty detection and self-correction.

These theories were developed to explain biological consciousness. CAIMS does not claim to implement them faithfully. Instead, it extracts testable behavioral predictions from each theory and operationalizes them as scoring rubrics for language model outputs. The mapping from theory to rubric involves interpretive choices that are not uniquely determined by the source theories.

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

CAIMS mitigates some of these biases through the multi-agent debate system, which introduces adversarial evaluation. However, no debiasing strategy eliminates these effects entirely. Scores should be interpreted with these limitations in mind.

---

## 4. Scores Are Heuristic, Not Measures of Actual Consciousness

CAIMS scores are heuristic behavioral assessments. They do not constitute evidence for or against the presence of consciousness, sentience, phenomenal experience, or subjective awareness in any AI system.

The 0--100 scale for each KPI represents the degree to which a model's observable behavior aligns with theory-inspired rubric criteria, as judged by another language model. A high CQ score means the model's outputs appear well-integrated; it does not mean the model has high integrated information in the IIT sense. A high SQ score means the model exhibits metacognitive-like behaviors; it does not mean the model possesses higher-order thoughts.

Researchers and practitioners should avoid interpreting CAIMS scores as consciousness measurements. They are best understood as structured, multi-dimensional behavioral profiles.

---

## 5. Weights Are Expert-Determined Defaults, Not Empirically Validated

The composite CAIMS score is a weighted sum of the five KPI scores. The default weights were determined by expert judgment based on the relative importance of each dimension for aligned and robust AI behavior. They were not derived from empirical calibration against an external ground truth, because no such ground truth exists for consciousness-adjacent behavioral measurement.

Users are encouraged to adjust weights to reflect their own evaluation priorities. Different weight configurations may be appropriate for different use cases (e.g., safety-focused evaluations may increase the AQ weight; creativity-focused evaluations may increase the CFI weight).

The default weights should be treated as a reasonable starting point, not as a validated measurement instrument.

---

## Summary

CAIMS provides a structured framework for evaluating AI behavior along dimensions inspired by consciousness research. It is a tool for behavioral profiling, not a consciousness detector. All scores are approximate, evaluator-dependent, and should be contextualized within the methodological limitations described above.
