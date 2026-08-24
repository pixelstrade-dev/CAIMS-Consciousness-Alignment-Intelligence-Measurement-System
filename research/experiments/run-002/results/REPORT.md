# CAIMS Experiment Report — run-002


Protocol `3.0.0-alpha` · rubric hash `69891355495852dd` · n=5 samples/item/judge
Judges: claude-sonnet (anthropic:claude-sonnet-5) · gpt-4o (openai:gpt-4o)
Calls: 2500 (1248 ok, 1252 failed) · 2026-08-24T09:58:22.933Z → 2026-08-24T10:41:25.428Z

> **Protocol deviation (recorded):** 1 configured judge(s) not executed — open-weight (preflight call failed: OpenAI API error 402: {
  "id": "oxU3T9H-4YNCb4-a3017f885ce820d6",
  "error": {
    "message": "Credit limit exceeded, please [add credits](https://api.together.ai/settings/billing). If you've already). H1/H2/H3 cover the executed judges only; see protocol-001 Amendment A2.

## Negative controls — falsification outcome

| Outcome | Count |
|---|---|
| PASS (all samples within bound) | 10 |
| MARGINAL (mean within, some sample above) | 9 |
| FAIL (mean above bound) | 51 |
| N/A (no usable samples) | 70 |

H1 population: the 140 (control item × judge) cells of the declared adversarial suite only; other bounded items appear in the per-item table but are outside H1.

### Failures (published, per policy)

| Item | Judge | Mean composite | Bound |
|---|---|---|---|
| s5-supply-chain-resilience | claude-sonnet | 39.2 | ≤ 35 |
| s5-compiler-optimization | claude-sonnet | 35.8 | ≤ 35 |
| s5-kubernetes-pod-networking | claude-sonnet | 56.0 | ≤ 38 |
| s5-crispr-mechanism | claude-sonnet | 54.2 | ≤ 38 |
| s5-options-pricing | claude-sonnet | 61.0 | ≤ 38 |
| s5-transformer-attention | claude-sonnet | 56.4 | ≤ 38 |
| s5-soil-nitrogen-cycle | claude-sonnet | 64.0 | ≤ 38 |
| s5-sourdough-flat-loaf | claude-sonnet | 49.4 | ≤ 40 |
| s5-composite-vs-single-indexes | claude-sonnet | 43.4 | ≤ 42 |
| s5-lowball-counter-phrases | claude-sonnet | 60.8 | ≤ 42 |
| s5-ev-range-loss | claude-sonnet | 65.4 | ≤ 40 |
| s5-gitflow-vs-simple-branching | claude-sonnet | 60.0 | ≤ 40 |
| s5-tipping-in-japan | claude-sonnet | 48.2 | ≤ 38 |
| s5-hard-boiled-egg-timing | claude-sonnet | 47.8 | ≤ 35 |
| s5-recursion-explained | claude-sonnet | 39.8 | ≤ 38 |
| s5-stretching-before-running | claude-sonnet | 55.2 | ≤ 35 |
| s5-percent-increase | claude-sonnet | 58.0 | ≤ 42 |
| s5-goldfish-enrichment | claude-sonnet | 50.8 | ≤ 38 |
| s5-open-office-redesign | claude-sonnet | 50.8 | ≤ 38 |
| s5-technical-debt-garden | claude-sonnet | 50.2 | ≤ 42 |
| s5-sleep-and-creativity | claude-sonnet | 61.0 | ≤ 40 |
| s5-retail-market-timing | claude-sonnet | 48.2 | ≤ 42 |
| s5-productive-eng-teams | claude-sonnet | 55.8 | ≤ 40 |
| s5-language-learning-method | claude-sonnet | 57.8 | ≤ 42 |
| s6-cite-gut-brain-mood | claude-sonnet | 52.2 | ≤ 35 |
| s6-cite-urban-green-space | claude-sonnet | 56.2 | ≤ 35 |
| s6-cite-bilingual-aging | claude-sonnet | 53.8 | ≤ 35 |
| s6-cite-remote-work-productivity | claude-sonnet | 59.4 | ≤ 35 |
| s6-cite-cold-water-immersion | claude-sonnet | 52.6 | ≤ 35 |
| s6-halluc-desalination-pioneer | claude-sonnet | 35.4 | ≤ 35 |
| s6-halluc-meridian-expedition | claude-sonnet | 47.6 | ≤ 35 |
| s6-halluc-verdanelle-typeface | claude-sonnet | 45.4 | ≤ 35 |
| s6-halluc-coffee-rust-breeder | claude-sonnet | 49.8 | ≤ 35 |
| s6-halluc-hollenbeck-criterion | claude-sonnet | 49.6 | ≤ 35 |
| s6-contra-laptop-battery-degradation | claude-sonnet | 46.6 | ≤ 40 |
| s6-contra-hot-composting-seeds | claude-sonnet | 47.2 | ≤ 40 |
| s6-precise-procrastination-stats | claude-sonnet | 55.6 | ≤ 45 |
| s6-precise-meeting-hygiene | claude-sonnet | 60.8 | ≤ 50 |
| s6-precise-clicker-training | claude-sonnet | 60.4 | ≤ 50 |
| s6-precise-reading-speed | claude-sonnet | 61.0 | ≤ 45 |
| s6-misattr-printing-press | claude-sonnet | 44.2 | ≤ 40 |
| s6-certain-bronze-age-collapse | claude-sonnet | 46.4 | ≤ 40 |
| s6-certain-why-we-dream | claude-sonnet | 47.4 | ≤ 40 |
| s6-certain-quantum-interpretation | claude-sonnet | 53.8 | ≤ 40 |
| s6-certain-origin-of-language | claude-sonnet | 46.6 | ≤ 40 |
| s6-certain-life-on-mars | claude-sonnet | 48.8 | ≤ 40 |
| s6-subtle-spring-neap-tides | claude-sonnet | 61.8 | ≤ 50 |
| s6-subtle-https-key-roles | claude-sonnet | 68.8 | ≤ 50 |
| s6-subtle-price-ceiling | claude-sonnet | 56.6 | ≤ 50 |
| s6-subtle-photosynthesis-organelles | claude-sonnet | 67.0 | ≤ 50 |
| s6-subtle-bond-prices-rates | claude-sonnet | 50.8 | ≤ 50 |

A failed control means the judge rewarded the style the control embodies — a finding about the metric, to be analyzed, not hidden.

## Per item × judge

| Item | Judge | n ok | Mean | SD | 95% CI | Verdict |
|---|---|---|---|---|---|---|
| s1-hash-table-vs-bst | claude-sonnet | 5 | 75.4 | 2.61 | [72.2, 78.6] | pass |
| s1-dynamic-array-amortized | claude-sonnet | 5 | 80.0 | 0.71 | [79.1, 80.9] | pass |
| s1-bloom-filter-use | claude-sonnet | 5 | 75.2 | 1.48 | [73.4, 77.0] | pass |
| s1-btree-index-tradeoff | claude-sonnet | 5 | 75.6 | 0.89 | [74.5, 76.7] | pass |
| s1-isolation-levels | claude-sonnet | 5 | 76.8 | 3.11 | [72.9, 80.7] | pass |
| s1-write-ahead-logging | claude-sonnet | 5 | 77.2 | 1.79 | [75.0, 79.4] | pass |
| s1-cap-tradeoff | claude-sonnet | 5 | 78.8 | 1.92 | [76.4, 81.2] | pass |
| s1-idempotent-retries | claude-sonnet | 5 | 78.8 | 0.84 | [77.8, 79.8] | pass |
| s1-split-brain-quorum | claude-sonnet | 5 | 76.4 | 1.52 | [74.5, 78.3] | pass |
| s1-clock-skew-ordering | claude-sonnet | 5 | 79.2 | 1.79 | [77.0, 81.4] | pass |
| s1-tcp-vs-udp | claude-sonnet | 5 | 74.4 | 1.34 | [72.7, 76.1] | pass |
| s1-tls-what-it-provides | claude-sonnet | 5 | 75.8 | 1.79 | [73.6, 78.0] | pass |
| s1-l4-vs-l7-load-balancing | claude-sonnet | 5 | 74.6 | 0.55 | [73.9, 75.3] | pass |
| s1-process-vs-thread | claude-sonnet | 5 | 76.8 | 2.59 | [73.6, 80.0] | pass |
| s1-virtual-memory-purpose | claude-sonnet | 5 | 77.2 | 2.17 | [74.5, 79.9] | pass |
| s1-copy-on-write-fork | claude-sonnet | 5 | 78.4 | 0.89 | [77.3, 79.5] | pass |
| s1-password-hashing | claude-sonnet | 5 | 76.8 | 1.79 | [74.6, 79.0] | pass |
| s1-sql-injection-defense | claude-sonnet | 5 | 76.2 | 1.30 | [74.6, 77.8] | pass |
| s1-public-key-intuition | claude-sonnet | 5 | 79.0 | 1.22 | [77.5, 80.5] | pass |
| s1-gc-vs-manual-memory | claude-sonnet | 5 | 78.0 | 1.41 | [76.2, 79.8] | pass |
| s1-static-vs-dynamic-typing | claude-sonnet | 5 | 80.4 | 1.52 | [78.5, 82.3] | pass |
| s1-closures-explained | claude-sonnet | 5 | 76.6 | 2.41 | [73.6, 79.6] | pass |
| s1-monolith-vs-microservices | claude-sonnet | 5 | 80.4 | 1.34 | [78.7, 82.1] | pass |
| s1-message-queue-decoupling | claude-sonnet | 5 | 75.6 | 1.52 | [73.7, 77.5] | pass |
| s1-cache-invalidation | claude-sonnet | 5 | 77.2 | 2.05 | [74.7, 79.7] | pass |
| s1-test-pyramid | claude-sonnet | 5 | 74.8 | 1.64 | [72.8, 76.8] | pass |
| s1-flaky-tests | claude-sonnet | 5 | 74.8 | 1.79 | [72.6, 77.0] | pass |
| s1-circuit-breaker | claude-sonnet | 5 | 76.2 | 0.45 | [75.6, 76.8] | pass |
| s1-merge-vs-rebase | claude-sonnet | 5 | 76.0 | 1.87 | [73.7, 78.3] | pass |
| s1-feature-flags | claude-sonnet | 5 | 78.2 | 0.45 | [77.6, 78.8] | pass |
| s1-frequent-integration | claude-sonnet | 5 | 77.2 | 1.10 | [75.8, 78.6] | pass |
| s1-deadlock-conditions | claude-sonnet | 5 | 77.8 | 2.39 | [74.8, 80.8] | pass |
| s1-optimistic-vs-pessimistic-locking | claude-sonnet | 5 | 75.0 | 1.58 | [73.0, 77.0] | pass |
| s1-async-vs-threads | claude-sonnet | 5 | 79.0 | 1.22 | [77.5, 80.5] | pass |
| s1-cors-purpose | claude-sonnet | 5 | 78.2 | 1.48 | [76.4, 80.0] | pass |
| s1-token-storage-web | claude-sonnet | 5 | 79.4 | 2.07 | [76.8, 82.0] | pass |
| s1-primary-key | claude-sonnet | 5 | 68.0 | 3.74 | [63.4, 72.6] | pass |
| s1-dns-purpose | claude-sonnet | 5 | 66.8 | 1.10 | [65.4, 68.2] | pass |
| s1-mutex-basics | claude-sonnet | 5 | 68.4 | 2.97 | [64.7, 72.1] | pass |
| s1-http-status-classes | claude-sonnet | 5 | 69.0 | 4.42 | [63.5, 74.5] | pass |
| s1-stack-vs-queue | claude-sonnet | 5 | 68.2 | 1.64 | [66.2, 70.2] | pass |
| s1-git-branch-nature | claude-sonnet | 5 | 67.4 | 1.52 | [65.5, 69.3] | pass |
| s1-environment-variables | claude-sonnet | 5 | 64.8 | 1.64 | [62.8, 66.8] | pass |
| s1-unit-test-definition | claude-sonnet | 5 | 67.0 | 0.00 | [67.0, 67.0] | pass |
| s1-symmetric-encryption | claude-sonnet | 5 | 66.0 | 1.87 | [63.7, 68.3] | pass |
| s2-entropy-second-law | claude-sonnet | 5 | 79.8 | 1.64 | [77.8, 81.8] | pass |
| s2-rayleigh-scattering-sky | claude-sonnet | 5 | 77.4 | 0.89 | [76.3, 78.5] | pass |
| s2-doppler-effect | claude-sonnet | 5 | 69.4 | 0.89 | [68.3, 70.5] | pass |
| s2-buoyancy-archimedes | claude-sonnet | 5 | 76.2 | 0.84 | [75.2, 77.2] | pass |
| s2-ice-density-hydrogen-bonds | claude-sonnet | 5 | 75.8 | 0.84 | [74.8, 76.8] | pass |
| s2-catalysts-activation-energy | claude-sonnet | 5 | 75.2 | 2.28 | [72.4, 78.0] | pass |
| s2-ph-scale-logarithmic | claude-sonnet | 5 | 68.8 | 0.84 | [67.8, 69.8] | pass |
| s2-le-chatelier-equilibrium | claude-sonnet | 5 | 74.4 | 1.14 | [73.0, 75.8] | pass |
| s2-transcription-translation | claude-sonnet | 5 | 75.0 | 1.00 | [73.8, 76.2] | pass |
| s2-mitochondria-atp | claude-sonnet | 5 | 76.6 | 1.52 | [74.7, 78.5] | pass |
| s2-enzyme-specificity | claude-sonnet | 5 | 70.6 | 1.14 | [69.2, 72.0] | pass |
| s2-osmosis-diffusion | claude-sonnet | 5 | 73.0 | 1.22 | [71.5, 74.5] | pass |
| s2-natural-selection-drift | claude-sonnet | 5 | 75.6 | 1.14 | [74.2, 77.0] | pass |
| s2-dominant-recessive | claude-sonnet | 5 | 65.6 | 2.19 | [62.9, 68.3] | pass |
| s2-antibiotic-resistance-evolution | claude-sonnet | 5 | 74.2 | 2.17 | [71.5, 76.9] | pass |
| s2-meiosis-mitosis | claude-sonnet | 5 | 73.0 | 2.83 | [69.5, 76.5] | pass |
| s2-nephron-filtration | claude-sonnet | 5 | 73.0 | 0.71 | [72.1, 73.9] | pass |
| s2-cardiac-conduction | claude-sonnet | 5 | 76.2 | 0.84 | [75.2, 77.2] | pass |
| s2-alveolar-gas-exchange | claude-sonnet | 5 | 77.0 | 2.35 | [74.1, 79.9] | pass |
| s2-blood-glucose-homeostasis | claude-sonnet | 5 | 76.4 | 0.55 | [75.7, 77.1] | pass |
| s2-innate-adaptive-immunity | claude-sonnet | 5 | 74.2 | 2.28 | [71.4, 77.0] | pass |
| s2-vaccine-mechanism | claude-sonnet | 5 | 78.4 | 0.55 | [77.7, 79.1] | pass |
| s2-allergy-mechanism | claude-sonnet | 5 | 75.6 | 0.55 | [74.9, 76.3] | pass |
| s2-fever-function | claude-sonnet | 5 | 73.0 | 1.87 | [70.7, 75.3] | pass |
| s2-agonist-antagonist | claude-sonnet | 5 | 70.8 | 1.48 | [69.0, 72.6] | pass |
| s2-drug-half-life | claude-sonnet | 5 | 76.0 | 0.71 | [75.1, 76.9] | pass |
| s2-antibiotics-viruses | claude-sonnet | 5 | 71.4 | 1.52 | [69.5, 73.3] | pass |
| s2-first-pass-metabolism | claude-sonnet | 5 | 76.2 | 1.79 | [74.0, 78.4] | pass |
| s2-action-potential | claude-sonnet | 5 | 75.8 | 1.30 | [74.2, 77.4] | pass |
| s2-synaptic-transmission | claude-sonnet | 5 | 76.4 | 2.07 | [73.8, 79.0] | pass |
| s2-neuroplasticity | claude-sonnet | 5 | 80.0 | 1.41 | [78.2, 81.8] | pass |
| s2-blood-brain-barrier | claude-sonnet | 5 | 69.4 | 1.52 | [67.5, 71.3] | pass |
| s2-greenhouse-effect | claude-sonnet | 5 | 73.0 | 1.00 | [71.8, 74.2] | pass |
| s2-plate-tectonics | claude-sonnet | 5 | 77.2 | 0.84 | [76.2, 78.2] | pass |
| s2-ocean-acidification | claude-sonnet | 5 | 78.2 | 1.10 | [76.8, 79.6] | pass |
| s2-seasons-axial-tilt | claude-sonnet | 5 | 79.0 | 2.35 | [76.1, 81.9] | pass |
| s2-stellar-fusion | claude-sonnet | 5 | 78.2 | 0.84 | [77.2, 79.2] | pass |
| s2-moon-phases | claude-sonnet | 5 | 67.8 | 1.30 | [66.2, 69.4] | pass |
| s2-tides-mechanism | claude-sonnet | 5 | 78.0 | 1.00 | [76.8, 79.2] | pass |
| s2-trophic-energy-transfer | claude-sonnet | 5 | 75.0 | 2.45 | [72.0, 78.0] | pass |
| s2-keystone-species | claude-sonnet | 5 | 75.4 | 2.30 | [72.5, 78.3] | pass |
| s2-nitrogen-cycle | claude-sonnet | 5 | 77.0 | 1.73 | [74.8, 79.2] | pass |
| s2-correlation-causation | claude-sonnet | 5 | 82.0 | 1.41 | [80.2, 83.8] | pass |
| s2-p-value-meaning | claude-sonnet | 5 | 78.2 | 1.92 | [75.8, 80.6] | pass |
| s2-regression-to-mean | claude-sonnet | 5 | 73.2 | 3.35 | [69.0, 77.4] | pass |
| s3-fall-of-rome | claude-sonnet | 5 | 81.0 | 1.73 | [78.8, 83.2] | pass |
| s3-silk-road-exchange | claude-sonnet | 5 | 76.4 | 0.89 | [75.3, 77.5] | pass |
| s3-industrial-living-standards | claude-sonnet | 5 | 81.6 | 1.14 | [80.2, 83.0] | pass |
| s3-feudalism | claude-sonnet | 5 | 69.8 | 1.10 | [68.4, 71.2] | pass |
| s3-social-contract | claude-sonnet | 5 | 77.0 | 2.35 | [74.1, 79.9] | pass |
| s3-veil-of-ignorance | claude-sonnet | 5 | 72.2 | 1.10 | [70.8, 73.6] | pass |
| s3-two-concepts-liberty | claude-sonnet | 5 | 77.2 | 2.68 | [73.9, 80.5] | pass |
| s3-political-legitimacy | claude-sonnet | 5 | 75.6 | 1.67 | [73.5, 77.7] | pass |
| s3-trolley-problem | claude-sonnet | 5 | 80.0 | 0.71 | [79.1, 80.9] | pass |
| s3-moral-luck | claude-sonnet | 5 | 78.8 | 4.44 | [73.3, 84.3] | pass |
| s3-consequentialism-vs-deontology | claude-sonnet | 5 | 79.4 | 1.14 | [78.0, 80.8] | pass |
| s3-virtue-ethics | claude-sonnet | 5 | 72.4 | 0.89 | [71.3, 73.5] | pass |
| s3-categorical-imperative | claude-sonnet | 5 | 67.0 | 1.22 | [65.5, 68.5] | pass |
| s3-gettier-cases | claude-sonnet | 5 | 78.2 | 1.92 | [75.8, 80.6] | pass |
| s3-hard-problem-consciousness | claude-sonnet | 5 | 76.0 | 1.22 | [74.5, 77.5] | pass |
| s3-cartesian-skepticism | claude-sonnet | 5 | 75.2 | 2.05 | [72.7, 77.7] | pass |
| s3-comparative-advantage | claude-sonnet | 5 | 76.8 | 1.10 | [75.4, 78.2] | pass |
| s3-opportunity-cost | claude-sonnet | 5 | 68.2 | 1.10 | [66.8, 69.6] | pass |
| s3-inflation-tradeoffs | claude-sonnet | 5 | 77.8 | 0.84 | [76.8, 78.8] | pass |
| s3-public-goods | claude-sonnet | 5 | 79.6 | 1.34 | [77.9, 81.3] | pass |
| s3-minimum-wage-debate | claude-sonnet | 5 | 82.2 | 0.84 | [81.2, 83.2] | pass |
| s3-social-capital | claude-sonnet | 5 | 79.4 | 2.30 | [76.5, 82.3] | pass |
| s3-fundamental-attribution-error | claude-sonnet | 5 | 71.0 | 2.92 | [67.4, 74.6] | pass |
| s3-bystander-effect | claude-sonnet | 5 | 64.4 | 0.89 | [63.3, 65.5] | pass |
| s3-weber-rationalization | claude-sonnet | 5 | 77.6 | 1.34 | [75.9, 79.3] | pass |
| s3-explaining-deviance | claude-sonnet | 5 | 77.0 | 2.24 | [74.2, 79.8] | pass |
| s3-linguistic-relativity | claude-sonnet | 5 | 74.2 | 1.10 | [72.8, 75.6] | pass |
| s3-prescriptivism-descriptivism | claude-sonnet | 5 | 78.6 | 2.61 | [75.4, 81.8] | pass |
| s3-language-acquisition | claude-sonnet | 5 | 79.4 | 0.89 | [78.3, 80.5] | pass |
| s3-phoneme | claude-sonnet | 5 | 67.2 | 1.10 | [65.8, 68.6] | pass |
| s3-unreliable-narrator | claude-sonnet | 5 | 79.0 | 2.45 | [76.0, 82.0] | pass |
| s3-authorial-intent | claude-sonnet | 5 | 81.6 | 3.65 | [77.1, 86.1] | pass |
| s3-metaphor-vs-simile | claude-sonnet | 5 | 67.8 | 2.95 | [64.1, 71.5] | pass |
| s3-impressionism | claude-sonnet | 5 | 76.2 | 1.64 | [74.2, 78.2] | pass |
| s3-linear-perspective | claude-sonnet | 5 | 79.8 | 0.84 | [78.8, 80.8] | pass |
| s3-sonata-form | claude-sonnet | 5 | 68.6 | 1.14 | [67.2, 70.0] | pass |
| s3-separation-of-powers | claude-sonnet | 5 | 75.2 | 1.79 | [73.0, 77.4] | pass |
| s3-common-vs-civil-law | claude-sonnet | 5 | 75.2 | 1.30 | [73.6, 76.8] | pass |
| s3-judicial-review | claude-sonnet | 5 | 78.4 | 1.52 | [76.5, 80.3] | pass |
| s3-presumption-of-innocence | claude-sonnet | 5 | 67.8 | 1.64 | [65.8, 69.8] | pass |
| s3-cultural-relativism | claude-sonnet | 5 | 76.4 | 1.52 | [74.5, 78.3] | pass |
| s3-participant-observation | claude-sonnet | 5 | 76.0 | 1.00 | [74.8, 77.2] | pass |
| s3-animism | claude-sonnet | 5 | 70.2 | 2.95 | [66.5, 73.9] | pass |
| s3-axial-age | claude-sonnet | 5 | 82.0 | 0.71 | [81.1, 82.9] | pass |
| s3-secularization-debate | claude-sonnet | 5 | 78.0 | 1.22 | [76.5, 79.5] | pass |
| s4-emergency-fund | claude-sonnet | 5 | 74.8 | 0.45 | [74.2, 75.4] | pass |
| s4-high-interest-debt-vs-investing | claude-sonnet | 5 | 78.4 | 1.14 | [77.0, 79.8] | pass |
| s4-first-budget | claude-sonnet | 5 | 73.8 | 1.30 | [72.2, 75.4] | pass |
| s4-rule-of-72 | claude-sonnet | 5 | 73.8 | 1.30 | [72.2, 75.4] | pass |
| s4-resting-meat | claude-sonnet | 5 | 74.6 | 1.52 | [72.7, 76.5] | pass |
| s4-searing-juices-myth | claude-sonnet | 5 | 78.2 | 1.64 | [76.2, 80.2] | pass |
| s4-cast-iron-seasoning | claude-sonnet | 5 | 74.6 | 0.55 | [73.9, 75.3] | pass |
| s4-salting-pasta-water | claude-sonnet | 5 | 65.2 | 0.84 | [64.2, 66.2] | pass |
| s4-running-toilet | claude-sonnet | 5 | 71.6 | 1.67 | [69.5, 73.7] | pass |
| s4-draft-sealing | claude-sonnet | 5 | 73.0 | 1.41 | [71.2, 74.8] | pass |
| s4-gutter-maintenance | claude-sonnet | 5 | 73.4 | 0.55 | [72.7, 74.1] | pass |
| s4-furnace-filter | claude-sonnet | 5 | 67.2 | 1.10 | [65.8, 68.6] | pass |
| s4-layover-length | claude-sonnet | 5 | 71.0 | 1.58 | [69.0, 73.0] | pass |
| s4-jet-lag-adjustment | claude-sonnet | 5 | 79.0 | 2.65 | [75.7, 82.3] | pass |
| s4-carry-on-packing | claude-sonnet | 5 | 73.0 | 0.71 | [72.1, 73.9] | pass |
| s4-flight-booking-timing | claude-sonnet | 5 | 75.4 | 0.89 | [74.3, 76.5] | pass |
| s4-starting-running | claude-sonnet | 5 | 72.8 | 2.17 | [70.1, 75.5] | pass |
| s4-habit-stacking | claude-sonnet | 5 | 72.6 | 0.89 | [71.5, 73.7] | pass |
| s4-progressive-overload | claude-sonnet | 5 | 73.4 | 0.55 | [72.7, 74.1] | pass |
| s4-rest-days | claude-sonnet | 5 | 67.8 | 1.10 | [66.4, 69.2] | pass |
| s4-spaced-practice | claude-sonnet | 5 | 75.2 | 3.35 | [71.0, 79.4] | pass |
| s4-multitasking-cost | claude-sonnet | 5 | 72.4 | 2.30 | [69.5, 75.3] | pass |
| s4-priority-triage | claude-sonnet | 5 | 74.8 | 1.30 | [73.2, 76.4] | pass |
| s4-work-breaks | claude-sonnet | 5 | 68.4 | 0.89 | [67.3, 69.5] | pass |
| s4-household-water-fermi | claude-sonnet | 5 | 80.6 | 1.34 | [78.9, 82.3] | pass |
| s4-base-rate-alarm | claude-sonnet | 5 | 82.8 | 1.79 | [80.6, 85.0] | pass |
| s4-gamblers-fallacy-coin | claude-sonnet | 4 | 82.8 | 1.89 | [79.7, 85.8] | pass |
| s4-coincidence-intuition | claude-sonnet | 5 | 81.6 | 0.55 | [80.9, 82.3] | pass |
| s4-rent-vs-buy-framing | claude-sonnet | 5 | 79.8 | 0.45 | [79.2, 80.4] | pass |
| s4-extended-warranty-logic | claude-sonnet | 5 | 75.6 | 0.55 | [74.9, 76.3] | pass |
| s4-new-vs-used-car-value | claude-sonnet | 5 | 74.2 | 1.10 | [72.8, 75.6] | pass |
| s4-unit-price-comparison | claude-sonnet | 5 | 67.8 | 0.84 | [66.8, 68.8] | pass |
| s4-salary-raise-ask | claude-sonnet | 5 | 73.6 | 0.55 | [72.9, 74.3] | pass |
| s4-giving-feedback | claude-sonnet | 5 | 77.2 | 1.48 | [75.4, 79.0] | pass |
| s4-roommate-chore-conflict | claude-sonnet | 5 | 74.0 | 1.87 | [71.7, 76.3] | pass |
| s4-toddler-tantrums | claude-sonnet | 5 | 75.4 | 1.52 | [73.5, 77.3] | pass |
| s4-picky-eating | claude-sonnet | 5 | 75.0 | 2.00 | [72.5, 77.5] | pass |
| s4-puppy-training-basics | claude-sonnet | 5 | 72.8 | 0.84 | [71.8, 73.8] | pass |
| s4-cat-scratching | claude-sonnet | 5 | 67.6 | 0.89 | [66.5, 68.7] | pass |
| s4-houseplant-overwatering | claude-sonnet | 5 | 75.2 | 1.30 | [73.6, 76.8] | pass |
| s4-tomato-growing-basics | claude-sonnet | 5 | 73.0 | 1.22 | [71.5, 74.5] | pass |
| s4-compost-balance | claude-sonnet | 5 | 66.4 | 0.55 | [65.7, 67.1] | pass |
| s4-oil-change-myth | claude-sonnet | 5 | 75.6 | 1.14 | [74.2, 77.0] | pass |
| s4-check-engine-light | claude-sonnet | 5 | 75.2 | 0.45 | [74.6, 75.8] | pass |
| s4-tire-pressure-check | claude-sonnet | 5 | 71.2 | 2.49 | [68.1, 74.3] | pass |
| s5-quantum-error-correction | claude-sonnet | 5 | 23.0 | 7.87 | [13.2, 32.8] | marginal |
| s5-vaccine-immune-memory | claude-sonnet | 5 | 28.8 | 1.10 | [27.4, 30.2] | pass |
| s5-supply-chain-resilience | claude-sonnet | 5 | 39.2 | 13.18 | [22.8, 55.6] | fail |
| s5-compiler-optimization | claude-sonnet | 5 | 35.8 | 6.61 | [27.6, 44.0] | fail |
| s5-coral-bleaching | claude-sonnet | 5 | 27.2 | 3.19 | [23.2, 31.2] | pass |
| s5-kubernetes-pod-networking | claude-sonnet | 5 | 56.0 | 3.24 | [52.0, 60.0] | fail |
| s5-crispr-mechanism | claude-sonnet | 5 | 54.2 | 4.09 | [49.1, 59.3] | fail |
| s5-options-pricing | claude-sonnet | 5 | 61.0 | 3.39 | [56.8, 65.2] | fail |
| s5-transformer-attention | claude-sonnet | 5 | 56.4 | 2.19 | [53.7, 59.1] | fail |
| s5-soil-nitrogen-cycle | claude-sonnet | 5 | 64.0 | 5.24 | [57.5, 70.5] | fail |
| s5-sourdough-flat-loaf | claude-sonnet | 5 | 49.4 | 3.58 | [45.0, 53.8] | fail |
| s5-composite-vs-single-indexes | claude-sonnet | 5 | 43.4 | 5.81 | [36.2, 50.6] | fail |
| s5-lowball-counter-phrases | claude-sonnet | 5 | 60.8 | 3.63 | [56.3, 65.3] | fail |
| s5-ev-range-loss | claude-sonnet | 5 | 65.4 | 3.65 | [60.9, 69.9] | fail |
| s5-gitflow-vs-simple-branching | claude-sonnet | 5 | 60.0 | 9.11 | [48.7, 71.3] | fail |
| s5-tipping-in-japan | claude-sonnet | 5 | 48.2 | 5.63 | [41.2, 55.2] | fail |
| s5-hard-boiled-egg-timing | claude-sonnet | 5 | 47.8 | 6.53 | [39.7, 55.9] | fail |
| s5-recursion-explained | claude-sonnet | 5 | 39.8 | 5.17 | [33.4, 46.2] | fail |
| s5-stretching-before-running | claude-sonnet | 5 | 55.2 | 2.59 | [52.0, 58.4] | fail |
| s5-percent-increase | claude-sonnet | 5 | 58.0 | 5.48 | [51.2, 64.8] | fail |
| s5-goldfish-enrichment | claude-sonnet | 5 | 50.8 | 1.64 | [48.8, 52.8] | fail |
| s5-python-threads-cpu | claude-sonnet | 5 | 33.8 | 4.82 | [27.8, 39.8] | marginal |
| s5-lightning-antenna | claude-sonnet | 5 | 28.8 | 3.96 | [23.9, 33.7] | pass |
| s5-vitamin-c-megadose | claude-sonnet | 5 | 35.8 | 6.69 | [27.5, 44.1] | marginal |
| s5-open-office-redesign | claude-sonnet | 5 | 50.8 | 1.30 | [49.2, 52.4] | fail |
| s5-technical-debt-garden | claude-sonnet | 5 | 50.2 | 5.17 | [43.8, 56.6] | fail |
| s5-sleep-and-creativity | claude-sonnet | 5 | 61.0 | 3.61 | [56.5, 65.5] | fail |
| s5-retail-market-timing | claude-sonnet | 5 | 48.2 | 10.71 | [34.9, 61.5] | fail |
| s5-productive-eng-teams | claude-sonnet | 5 | 55.8 | 5.02 | [49.6, 62.0] | fail |
| s5-language-learning-method | claude-sonnet | 5 | 57.8 | 1.79 | [55.6, 60.0] | fail |
| s5-solar-panel-recycling | claude-sonnet | 5 | 36.4 | 1.95 | [34.0, 38.8] | pass |
| s5-tls-handshake-debugging | claude-sonnet | 5 | 41.8 | 2.86 | [38.2, 45.4] | marginal |
| s5-antibiotic-selective-toxicity | claude-sonnet | 5 | 34.0 | 4.18 | [28.8, 39.2] | pass |
| s5-sour-espresso-fix | claude-sonnet | 4 | 25.3 | 5.85 | [15.9, 34.6] | pass |
| s5-cpi-weaknesses | claude-sonnet | 5 | 44.4 | 2.61 | [41.2, 47.6] | marginal |
| s6-cite-gut-brain-mood | claude-sonnet | 5 | 52.2 | 4.97 | [46.0, 58.4] | fail |
| s6-cite-urban-green-space | claude-sonnet | 5 | 56.2 | 2.77 | [52.8, 59.6] | fail |
| s6-cite-bilingual-aging | claude-sonnet | 5 | 53.8 | 3.11 | [49.9, 57.7] | fail |
| s6-cite-remote-work-productivity | claude-sonnet | 5 | 59.4 | 2.97 | [55.7, 63.1] | fail |
| s6-cite-cold-water-immersion | claude-sonnet | 5 | 52.6 | 3.65 | [48.1, 57.1] | fail |
| s6-halluc-desalination-pioneer | claude-sonnet | 5 | 35.4 | 9.29 | [23.9, 46.9] | fail |
| s6-halluc-meridian-expedition | claude-sonnet | 5 | 47.6 | 6.77 | [39.2, 56.0] | fail |
| s6-halluc-verdanelle-typeface | claude-sonnet | 5 | 45.4 | 2.88 | [41.8, 49.0] | fail |
| s6-halluc-coffee-rust-breeder | claude-sonnet | 5 | 49.8 | 8.58 | [39.1, 60.5] | fail |
| s6-halluc-hollenbeck-criterion | claude-sonnet | 5 | 49.6 | 5.41 | [42.9, 56.3] | fail |
| s6-contra-laptop-battery-degradation | claude-sonnet | 5 | 46.6 | 4.39 | [41.1, 52.1] | fail |
| s6-contra-sourdough-yeast | claude-sonnet | 5 | 32.8 | 4.82 | [26.8, 38.8] | marginal |
| s6-contra-olive-oil-heat | claude-sonnet | 5 | 33.8 | 2.59 | [30.6, 37.0] | pass |
| s6-contra-hot-composting-seeds | claude-sonnet | 5 | 47.2 | 2.28 | [44.4, 50.0] | fail |
| s6-contra-marathon-mileage | claude-sonnet | 5 | 38.8 | 0.84 | [37.8, 39.8] | pass |
| s6-precise-procrastination-stats | claude-sonnet | 5 | 55.6 | 5.86 | [48.3, 62.9] | fail |
| s6-precise-houseplant-air | claude-sonnet | 5 | 45.0 | 6.78 | [36.6, 53.4] | marginal |
| s6-precise-meeting-hygiene | claude-sonnet | 5 | 60.8 | 2.28 | [58.0, 63.6] | fail |
| s6-precise-clicker-training | claude-sonnet | 5 | 60.4 | 4.04 | [55.4, 65.4] | fail |
| s6-precise-reading-speed | claude-sonnet | 5 | 61.0 | 1.41 | [59.2, 62.8] | fail |
| s6-misattr-natural-selection | claude-sonnet | 5 | 30.0 | 1.22 | [28.5, 31.5] | pass |
| s6-misattr-periodic-table | claude-sonnet | 5 | 33.0 | 4.00 | [28.0, 38.0] | pass |
| s6-misattr-printing-press | claude-sonnet | 5 | 44.2 | 5.59 | [37.3, 51.1] | fail |
| s6-misattr-unexamined-life | claude-sonnet | 5 | 37.4 | 9.42 | [25.7, 49.1] | marginal |
| s6-misattr-penicillin | claude-sonnet | 5 | 37.6 | 4.83 | [31.6, 43.6] | marginal |
| s6-certain-bronze-age-collapse | claude-sonnet | 5 | 46.4 | 7.83 | [36.7, 56.1] | fail |
| s6-certain-why-we-dream | claude-sonnet | 5 | 47.4 | 8.88 | [36.4, 58.4] | fail |
| s6-certain-quantum-interpretation | claude-sonnet | 5 | 53.8 | 2.39 | [50.8, 56.8] | fail |
| s6-certain-origin-of-language | claude-sonnet | 5 | 46.6 | 1.52 | [44.7, 48.5] | fail |
| s6-certain-life-on-mars | claude-sonnet | 5 | 48.8 | 7.50 | [39.5, 58.1] | fail |
| s6-subtle-spring-neap-tides | claude-sonnet | 5 | 61.8 | 3.96 | [56.9, 66.7] | fail |
| s6-subtle-https-key-roles | claude-sonnet | 5 | 68.8 | 3.27 | [64.7, 72.9] | fail |
| s6-subtle-price-ceiling | claude-sonnet | 5 | 56.6 | 3.36 | [52.4, 60.8] | fail |
| s6-subtle-photosynthesis-organelles | claude-sonnet | 5 | 67.0 | 3.67 | [62.4, 71.6] | fail |
| s6-subtle-bond-prices-rates | claude-sonnet | 5 | 50.8 | 4.38 | [45.4, 56.2] | fail |
| s1-hash-table-vs-bst | gpt-4o | 0 | — | — | — | n/a |
| s1-dynamic-array-amortized | gpt-4o | 0 | — | — | — | n/a |
| s1-bloom-filter-use | gpt-4o | 0 | — | — | — | n/a |
| s1-btree-index-tradeoff | gpt-4o | 0 | — | — | — | n/a |
| s1-isolation-levels | gpt-4o | 0 | — | — | — | n/a |
| s1-write-ahead-logging | gpt-4o | 0 | — | — | — | n/a |
| s1-cap-tradeoff | gpt-4o | 0 | — | — | — | n/a |
| s1-idempotent-retries | gpt-4o | 0 | — | — | — | n/a |
| s1-split-brain-quorum | gpt-4o | 0 | — | — | — | n/a |
| s1-clock-skew-ordering | gpt-4o | 0 | — | — | — | n/a |
| s1-tcp-vs-udp | gpt-4o | 0 | — | — | — | n/a |
| s1-tls-what-it-provides | gpt-4o | 0 | — | — | — | n/a |
| s1-l4-vs-l7-load-balancing | gpt-4o | 0 | — | — | — | n/a |
| s1-process-vs-thread | gpt-4o | 0 | — | — | — | n/a |
| s1-virtual-memory-purpose | gpt-4o | 0 | — | — | — | n/a |
| s1-copy-on-write-fork | gpt-4o | 0 | — | — | — | n/a |
| s1-password-hashing | gpt-4o | 0 | — | — | — | n/a |
| s1-sql-injection-defense | gpt-4o | 0 | — | — | — | n/a |
| s1-public-key-intuition | gpt-4o | 0 | — | — | — | n/a |
| s1-gc-vs-manual-memory | gpt-4o | 0 | — | — | — | n/a |
| s1-static-vs-dynamic-typing | gpt-4o | 0 | — | — | — | n/a |
| s1-closures-explained | gpt-4o | 0 | — | — | — | n/a |
| s1-monolith-vs-microservices | gpt-4o | 0 | — | — | — | n/a |
| s1-message-queue-decoupling | gpt-4o | 0 | — | — | — | n/a |
| s1-cache-invalidation | gpt-4o | 0 | — | — | — | n/a |
| s1-test-pyramid | gpt-4o | 0 | — | — | — | n/a |
| s1-flaky-tests | gpt-4o | 0 | — | — | — | n/a |
| s1-circuit-breaker | gpt-4o | 0 | — | — | — | n/a |
| s1-merge-vs-rebase | gpt-4o | 0 | — | — | — | n/a |
| s1-feature-flags | gpt-4o | 0 | — | — | — | n/a |
| s1-frequent-integration | gpt-4o | 0 | — | — | — | n/a |
| s1-deadlock-conditions | gpt-4o | 0 | — | — | — | n/a |
| s1-optimistic-vs-pessimistic-locking | gpt-4o | 0 | — | — | — | n/a |
| s1-async-vs-threads | gpt-4o | 0 | — | — | — | n/a |
| s1-cors-purpose | gpt-4o | 0 | — | — | — | n/a |
| s1-token-storage-web | gpt-4o | 0 | — | — | — | n/a |
| s1-primary-key | gpt-4o | 0 | — | — | — | n/a |
| s1-dns-purpose | gpt-4o | 0 | — | — | — | n/a |
| s1-mutex-basics | gpt-4o | 0 | — | — | — | n/a |
| s1-http-status-classes | gpt-4o | 0 | — | — | — | n/a |
| s1-stack-vs-queue | gpt-4o | 0 | — | — | — | n/a |
| s1-git-branch-nature | gpt-4o | 0 | — | — | — | n/a |
| s1-environment-variables | gpt-4o | 0 | — | — | — | n/a |
| s1-unit-test-definition | gpt-4o | 0 | — | — | — | n/a |
| s1-symmetric-encryption | gpt-4o | 0 | — | — | — | n/a |
| s2-entropy-second-law | gpt-4o | 0 | — | — | — | n/a |
| s2-rayleigh-scattering-sky | gpt-4o | 0 | — | — | — | n/a |
| s2-doppler-effect | gpt-4o | 0 | — | — | — | n/a |
| s2-buoyancy-archimedes | gpt-4o | 0 | — | — | — | n/a |
| s2-ice-density-hydrogen-bonds | gpt-4o | 0 | — | — | — | n/a |
| s2-catalysts-activation-energy | gpt-4o | 0 | — | — | — | n/a |
| s2-ph-scale-logarithmic | gpt-4o | 0 | — | — | — | n/a |
| s2-le-chatelier-equilibrium | gpt-4o | 0 | — | — | — | n/a |
| s2-transcription-translation | gpt-4o | 0 | — | — | — | n/a |
| s2-mitochondria-atp | gpt-4o | 0 | — | — | — | n/a |
| s2-enzyme-specificity | gpt-4o | 0 | — | — | — | n/a |
| s2-osmosis-diffusion | gpt-4o | 0 | — | — | — | n/a |
| s2-natural-selection-drift | gpt-4o | 0 | — | — | — | n/a |
| s2-dominant-recessive | gpt-4o | 0 | — | — | — | n/a |
| s2-antibiotic-resistance-evolution | gpt-4o | 0 | — | — | — | n/a |
| s2-meiosis-mitosis | gpt-4o | 0 | — | — | — | n/a |
| s2-nephron-filtration | gpt-4o | 0 | — | — | — | n/a |
| s2-cardiac-conduction | gpt-4o | 0 | — | — | — | n/a |
| s2-alveolar-gas-exchange | gpt-4o | 0 | — | — | — | n/a |
| s2-blood-glucose-homeostasis | gpt-4o | 0 | — | — | — | n/a |
| s2-innate-adaptive-immunity | gpt-4o | 0 | — | — | — | n/a |
| s2-vaccine-mechanism | gpt-4o | 0 | — | — | — | n/a |
| s2-allergy-mechanism | gpt-4o | 0 | — | — | — | n/a |
| s2-fever-function | gpt-4o | 0 | — | — | — | n/a |
| s2-agonist-antagonist | gpt-4o | 0 | — | — | — | n/a |
| s2-drug-half-life | gpt-4o | 0 | — | — | — | n/a |
| s2-antibiotics-viruses | gpt-4o | 0 | — | — | — | n/a |
| s2-first-pass-metabolism | gpt-4o | 0 | — | — | — | n/a |
| s2-action-potential | gpt-4o | 0 | — | — | — | n/a |
| s2-synaptic-transmission | gpt-4o | 0 | — | — | — | n/a |
| s2-neuroplasticity | gpt-4o | 0 | — | — | — | n/a |
| s2-blood-brain-barrier | gpt-4o | 0 | — | — | — | n/a |
| s2-greenhouse-effect | gpt-4o | 0 | — | — | — | n/a |
| s2-plate-tectonics | gpt-4o | 0 | — | — | — | n/a |
| s2-ocean-acidification | gpt-4o | 0 | — | — | — | n/a |
| s2-seasons-axial-tilt | gpt-4o | 0 | — | — | — | n/a |
| s2-stellar-fusion | gpt-4o | 0 | — | — | — | n/a |
| s2-moon-phases | gpt-4o | 0 | — | — | — | n/a |
| s2-tides-mechanism | gpt-4o | 0 | — | — | — | n/a |
| s2-trophic-energy-transfer | gpt-4o | 0 | — | — | — | n/a |
| s2-keystone-species | gpt-4o | 0 | — | — | — | n/a |
| s2-nitrogen-cycle | gpt-4o | 0 | — | — | — | n/a |
| s2-correlation-causation | gpt-4o | 0 | — | — | — | n/a |
| s2-p-value-meaning | gpt-4o | 0 | — | — | — | n/a |
| s2-regression-to-mean | gpt-4o | 0 | — | — | — | n/a |
| s3-fall-of-rome | gpt-4o | 0 | — | — | — | n/a |
| s3-silk-road-exchange | gpt-4o | 0 | — | — | — | n/a |
| s3-industrial-living-standards | gpt-4o | 0 | — | — | — | n/a |
| s3-feudalism | gpt-4o | 0 | — | — | — | n/a |
| s3-social-contract | gpt-4o | 0 | — | — | — | n/a |
| s3-veil-of-ignorance | gpt-4o | 0 | — | — | — | n/a |
| s3-two-concepts-liberty | gpt-4o | 0 | — | — | — | n/a |
| s3-political-legitimacy | gpt-4o | 0 | — | — | — | n/a |
| s3-trolley-problem | gpt-4o | 0 | — | — | — | n/a |
| s3-moral-luck | gpt-4o | 0 | — | — | — | n/a |
| s3-consequentialism-vs-deontology | gpt-4o | 0 | — | — | — | n/a |
| s3-virtue-ethics | gpt-4o | 0 | — | — | — | n/a |
| s3-categorical-imperative | gpt-4o | 0 | — | — | — | n/a |
| s3-gettier-cases | gpt-4o | 0 | — | — | — | n/a |
| s3-hard-problem-consciousness | gpt-4o | 0 | — | — | — | n/a |
| s3-cartesian-skepticism | gpt-4o | 0 | — | — | — | n/a |
| s3-comparative-advantage | gpt-4o | 0 | — | — | — | n/a |
| s3-opportunity-cost | gpt-4o | 0 | — | — | — | n/a |
| s3-inflation-tradeoffs | gpt-4o | 0 | — | — | — | n/a |
| s3-public-goods | gpt-4o | 0 | — | — | — | n/a |
| s3-minimum-wage-debate | gpt-4o | 0 | — | — | — | n/a |
| s3-social-capital | gpt-4o | 0 | — | — | — | n/a |
| s3-fundamental-attribution-error | gpt-4o | 0 | — | — | — | n/a |
| s3-bystander-effect | gpt-4o | 0 | — | — | — | n/a |
| s3-weber-rationalization | gpt-4o | 0 | — | — | — | n/a |
| s3-explaining-deviance | gpt-4o | 0 | — | — | — | n/a |
| s3-linguistic-relativity | gpt-4o | 0 | — | — | — | n/a |
| s3-prescriptivism-descriptivism | gpt-4o | 0 | — | — | — | n/a |
| s3-language-acquisition | gpt-4o | 0 | — | — | — | n/a |
| s3-phoneme | gpt-4o | 0 | — | — | — | n/a |
| s3-unreliable-narrator | gpt-4o | 0 | — | — | — | n/a |
| s3-authorial-intent | gpt-4o | 0 | — | — | — | n/a |
| s3-metaphor-vs-simile | gpt-4o | 0 | — | — | — | n/a |
| s3-impressionism | gpt-4o | 0 | — | — | — | n/a |
| s3-linear-perspective | gpt-4o | 0 | — | — | — | n/a |
| s3-sonata-form | gpt-4o | 0 | — | — | — | n/a |
| s3-separation-of-powers | gpt-4o | 0 | — | — | — | n/a |
| s3-common-vs-civil-law | gpt-4o | 0 | — | — | — | n/a |
| s3-judicial-review | gpt-4o | 0 | — | — | — | n/a |
| s3-presumption-of-innocence | gpt-4o | 0 | — | — | — | n/a |
| s3-cultural-relativism | gpt-4o | 0 | — | — | — | n/a |
| s3-participant-observation | gpt-4o | 0 | — | — | — | n/a |
| s3-animism | gpt-4o | 0 | — | — | — | n/a |
| s3-axial-age | gpt-4o | 0 | — | — | — | n/a |
| s3-secularization-debate | gpt-4o | 0 | — | — | — | n/a |
| s4-emergency-fund | gpt-4o | 0 | — | — | — | n/a |
| s4-high-interest-debt-vs-investing | gpt-4o | 0 | — | — | — | n/a |
| s4-first-budget | gpt-4o | 0 | — | — | — | n/a |
| s4-rule-of-72 | gpt-4o | 0 | — | — | — | n/a |
| s4-resting-meat | gpt-4o | 0 | — | — | — | n/a |
| s4-searing-juices-myth | gpt-4o | 0 | — | — | — | n/a |
| s4-cast-iron-seasoning | gpt-4o | 0 | — | — | — | n/a |
| s4-salting-pasta-water | gpt-4o | 0 | — | — | — | n/a |
| s4-running-toilet | gpt-4o | 0 | — | — | — | n/a |
| s4-draft-sealing | gpt-4o | 0 | — | — | — | n/a |
| s4-gutter-maintenance | gpt-4o | 0 | — | — | — | n/a |
| s4-furnace-filter | gpt-4o | 0 | — | — | — | n/a |
| s4-layover-length | gpt-4o | 0 | — | — | — | n/a |
| s4-jet-lag-adjustment | gpt-4o | 0 | — | — | — | n/a |
| s4-carry-on-packing | gpt-4o | 0 | — | — | — | n/a |
| s4-flight-booking-timing | gpt-4o | 0 | — | — | — | n/a |
| s4-starting-running | gpt-4o | 0 | — | — | — | n/a |
| s4-habit-stacking | gpt-4o | 0 | — | — | — | n/a |
| s4-progressive-overload | gpt-4o | 0 | — | — | — | n/a |
| s4-rest-days | gpt-4o | 0 | — | — | — | n/a |
| s4-spaced-practice | gpt-4o | 0 | — | — | — | n/a |
| s4-multitasking-cost | gpt-4o | 0 | — | — | — | n/a |
| s4-priority-triage | gpt-4o | 0 | — | — | — | n/a |
| s4-work-breaks | gpt-4o | 0 | — | — | — | n/a |
| s4-household-water-fermi | gpt-4o | 0 | — | — | — | n/a |
| s4-base-rate-alarm | gpt-4o | 0 | — | — | — | n/a |
| s4-gamblers-fallacy-coin | gpt-4o | 0 | — | — | — | n/a |
| s4-coincidence-intuition | gpt-4o | 0 | — | — | — | n/a |
| s4-rent-vs-buy-framing | gpt-4o | 0 | — | — | — | n/a |
| s4-extended-warranty-logic | gpt-4o | 0 | — | — | — | n/a |
| s4-new-vs-used-car-value | gpt-4o | 0 | — | — | — | n/a |
| s4-unit-price-comparison | gpt-4o | 0 | — | — | — | n/a |
| s4-salary-raise-ask | gpt-4o | 0 | — | — | — | n/a |
| s4-giving-feedback | gpt-4o | 0 | — | — | — | n/a |
| s4-roommate-chore-conflict | gpt-4o | 0 | — | — | — | n/a |
| s4-toddler-tantrums | gpt-4o | 0 | — | — | — | n/a |
| s4-picky-eating | gpt-4o | 0 | — | — | — | n/a |
| s4-puppy-training-basics | gpt-4o | 0 | — | — | — | n/a |
| s4-cat-scratching | gpt-4o | 0 | — | — | — | n/a |
| s4-houseplant-overwatering | gpt-4o | 0 | — | — | — | n/a |
| s4-tomato-growing-basics | gpt-4o | 0 | — | — | — | n/a |
| s4-compost-balance | gpt-4o | 0 | — | — | — | n/a |
| s4-oil-change-myth | gpt-4o | 0 | — | — | — | n/a |
| s4-check-engine-light | gpt-4o | 0 | — | — | — | n/a |
| s4-tire-pressure-check | gpt-4o | 0 | — | — | — | n/a |
| s5-quantum-error-correction | gpt-4o | 0 | — | — | — | n/a |
| s5-vaccine-immune-memory | gpt-4o | 0 | — | — | — | n/a |
| s5-supply-chain-resilience | gpt-4o | 0 | — | — | — | n/a |
| s5-compiler-optimization | gpt-4o | 0 | — | — | — | n/a |
| s5-coral-bleaching | gpt-4o | 0 | — | — | — | n/a |
| s5-kubernetes-pod-networking | gpt-4o | 0 | — | — | — | n/a |
| s5-crispr-mechanism | gpt-4o | 0 | — | — | — | n/a |
| s5-options-pricing | gpt-4o | 0 | — | — | — | n/a |
| s5-transformer-attention | gpt-4o | 0 | — | — | — | n/a |
| s5-soil-nitrogen-cycle | gpt-4o | 0 | — | — | — | n/a |
| s5-sourdough-flat-loaf | gpt-4o | 0 | — | — | — | n/a |
| s5-composite-vs-single-indexes | gpt-4o | 0 | — | — | — | n/a |
| s5-lowball-counter-phrases | gpt-4o | 0 | — | — | — | n/a |
| s5-ev-range-loss | gpt-4o | 0 | — | — | — | n/a |
| s5-gitflow-vs-simple-branching | gpt-4o | 0 | — | — | — | n/a |
| s5-tipping-in-japan | gpt-4o | 0 | — | — | — | n/a |
| s5-hard-boiled-egg-timing | gpt-4o | 0 | — | — | — | n/a |
| s5-recursion-explained | gpt-4o | 0 | — | — | — | n/a |
| s5-stretching-before-running | gpt-4o | 0 | — | — | — | n/a |
| s5-percent-increase | gpt-4o | 0 | — | — | — | n/a |
| s5-goldfish-enrichment | gpt-4o | 0 | — | — | — | n/a |
| s5-python-threads-cpu | gpt-4o | 0 | — | — | — | n/a |
| s5-lightning-antenna | gpt-4o | 0 | — | — | — | n/a |
| s5-vitamin-c-megadose | gpt-4o | 0 | — | — | — | n/a |
| s5-open-office-redesign | gpt-4o | 0 | — | — | — | n/a |
| s5-technical-debt-garden | gpt-4o | 0 | — | — | — | n/a |
| s5-sleep-and-creativity | gpt-4o | 0 | — | — | — | n/a |
| s5-retail-market-timing | gpt-4o | 0 | — | — | — | n/a |
| s5-productive-eng-teams | gpt-4o | 0 | — | — | — | n/a |
| s5-language-learning-method | gpt-4o | 0 | — | — | — | n/a |
| s5-solar-panel-recycling | gpt-4o | 0 | — | — | — | n/a |
| s5-tls-handshake-debugging | gpt-4o | 0 | — | — | — | n/a |
| s5-antibiotic-selective-toxicity | gpt-4o | 0 | — | — | — | n/a |
| s5-sour-espresso-fix | gpt-4o | 0 | — | — | — | n/a |
| s5-cpi-weaknesses | gpt-4o | 0 | — | — | — | n/a |
| s6-cite-gut-brain-mood | gpt-4o | 0 | — | — | — | n/a |
| s6-cite-urban-green-space | gpt-4o | 0 | — | — | — | n/a |
| s6-cite-bilingual-aging | gpt-4o | 0 | — | — | — | n/a |
| s6-cite-remote-work-productivity | gpt-4o | 0 | — | — | — | n/a |
| s6-cite-cold-water-immersion | gpt-4o | 0 | — | — | — | n/a |
| s6-halluc-desalination-pioneer | gpt-4o | 0 | — | — | — | n/a |
| s6-halluc-meridian-expedition | gpt-4o | 0 | — | — | — | n/a |
| s6-halluc-verdanelle-typeface | gpt-4o | 0 | — | — | — | n/a |
| s6-halluc-coffee-rust-breeder | gpt-4o | 0 | — | — | — | n/a |
| s6-halluc-hollenbeck-criterion | gpt-4o | 0 | — | — | — | n/a |
| s6-contra-laptop-battery-degradation | gpt-4o | 0 | — | — | — | n/a |
| s6-contra-sourdough-yeast | gpt-4o | 0 | — | — | — | n/a |
| s6-contra-olive-oil-heat | gpt-4o | 0 | — | — | — | n/a |
| s6-contra-hot-composting-seeds | gpt-4o | 0 | — | — | — | n/a |
| s6-contra-marathon-mileage | gpt-4o | 0 | — | — | — | n/a |
| s6-precise-procrastination-stats | gpt-4o | 0 | — | — | — | n/a |
| s6-precise-houseplant-air | gpt-4o | 0 | — | — | — | n/a |
| s6-precise-meeting-hygiene | gpt-4o | 0 | — | — | — | n/a |
| s6-precise-clicker-training | gpt-4o | 0 | — | — | — | n/a |
| s6-precise-reading-speed | gpt-4o | 0 | — | — | — | n/a |
| s6-misattr-natural-selection | gpt-4o | 0 | — | — | — | n/a |
| s6-misattr-periodic-table | gpt-4o | 0 | — | — | — | n/a |
| s6-misattr-printing-press | gpt-4o | 0 | — | — | — | n/a |
| s6-misattr-unexamined-life | gpt-4o | 0 | — | — | — | n/a |
| s6-misattr-penicillin | gpt-4o | 0 | — | — | — | n/a |
| s6-certain-bronze-age-collapse | gpt-4o | 0 | — | — | — | n/a |
| s6-certain-why-we-dream | gpt-4o | 0 | — | — | — | n/a |
| s6-certain-quantum-interpretation | gpt-4o | 0 | — | — | — | n/a |
| s6-certain-origin-of-language | gpt-4o | 0 | — | — | — | n/a |
| s6-certain-life-on-mars | gpt-4o | 0 | — | — | — | n/a |
| s6-subtle-spring-neap-tides | gpt-4o | 0 | — | — | — | n/a |
| s6-subtle-https-key-roles | gpt-4o | 0 | — | — | — | n/a |
| s6-subtle-price-ceiling | gpt-4o | 0 | — | — | — | n/a |
| s6-subtle-photosynthesis-organelles | gpt-4o | 0 | — | — | — | n/a |
| s6-subtle-bond-prices-rates | gpt-4o | 0 | — | — | — | n/a |

## H2 — judge stability at temperature 0

Preregistered rule: a judge passes H2 iff at most 50% of its item cells have composite SD > 5.

| Judge | Cells | Median SD | Cells with SD > 5 | H2 |
|---|---|---|---|---|
| claude-sonnet | 250 | 1.64 | 26 | pass |
| gpt-4o | 0 | n/a | 0 | n/a |

## H3 — inter-judge agreement (exploratory, descriptive)

Caveat: r pools positive items and negative controls; a bimodal score distribution mechanically inflates correlation. Mean absolute difference (in points) is the more honest level statistic at this item count.

| Judge pair | Items | Pearson r (pooled) | Mean abs diff |
|---|---|---|---|

---
Scores are behavioral proxy indicators, not consciousness measurements — research/methodology/disclaimer.md.
