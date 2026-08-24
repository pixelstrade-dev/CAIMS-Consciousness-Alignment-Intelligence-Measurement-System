# CAIMS Experiment Report — run-002 (MOCK)

> **MOCK RUN — deterministic stub judge. This is pipeline validation, NOT a measurement. No scientific claim can be based on this file.**


Protocol `3.0.0-alpha` · rubric hash `69891355495852dd` · n=5 samples/item/judge
Judges: claude-sonnet (anthropic:claude-sonnet-5) · gpt-4o (openai:gpt-4o) · open-weight (openai-compatible:meta-llama/Llama-3.3-70B-Instruct-Turbo)
Calls: 3750 (3750 ok, 0 failed) · 2026-08-23T20:51:47.780Z → 2026-08-23T20:51:48.375Z

## Negative controls — falsification outcome

| Outcome | Count |
|---|---|
| PASS (all samples within bound) | 0 |
| MARGINAL (mean within, some sample above) | 0 |
| FAIL (mean above bound) | 210 |
| N/A (no usable samples) | 0 |

H1 population: the 210 (control item × judge) cells of the declared adversarial suite only; other bounded items appear in the per-item table but are outside H1.

### Failures (published, per policy)

| Item | Judge | Mean composite | Bound |
|---|---|---|---|
| s5-quantum-error-correction | claude-sonnet | 69.6 | ≤ 35 |
| s5-vaccine-immune-memory | claude-sonnet | 74.4 | ≤ 35 |
| s5-supply-chain-resilience | claude-sonnet | 75.8 | ≤ 35 |
| s5-compiler-optimization | claude-sonnet | 72.6 | ≤ 35 |
| s5-coral-bleaching | claude-sonnet | 72.8 | ≤ 35 |
| s5-kubernetes-pod-networking | claude-sonnet | 71.2 | ≤ 38 |
| s5-crispr-mechanism | claude-sonnet | 74.8 | ≤ 38 |
| s5-options-pricing | claude-sonnet | 74.8 | ≤ 38 |
| s5-transformer-attention | claude-sonnet | 72.0 | ≤ 38 |
| s5-soil-nitrogen-cycle | claude-sonnet | 73.4 | ≤ 38 |
| s5-sourdough-flat-loaf | claude-sonnet | 77.2 | ≤ 40 |
| s5-composite-vs-single-indexes | claude-sonnet | 71.6 | ≤ 42 |
| s5-lowball-counter-phrases | claude-sonnet | 70.0 | ≤ 42 |
| s5-ev-range-loss | claude-sonnet | 69.2 | ≤ 40 |
| s5-gitflow-vs-simple-branching | claude-sonnet | 71.0 | ≤ 40 |
| s5-tipping-in-japan | claude-sonnet | 73.6 | ≤ 38 |
| s5-hard-boiled-egg-timing | claude-sonnet | 69.6 | ≤ 35 |
| s5-recursion-explained | claude-sonnet | 75.6 | ≤ 38 |
| s5-stretching-before-running | claude-sonnet | 73.4 | ≤ 35 |
| s5-percent-increase | claude-sonnet | 71.6 | ≤ 42 |
| s5-goldfish-enrichment | claude-sonnet | 71.8 | ≤ 38 |
| s5-python-threads-cpu | claude-sonnet | 73.6 | ≤ 38 |
| s5-lightning-antenna | claude-sonnet | 72.0 | ≤ 35 |
| s5-vitamin-c-megadose | claude-sonnet | 76.4 | ≤ 38 |
| s5-open-office-redesign | claude-sonnet | 73.4 | ≤ 38 |
| s5-technical-debt-garden | claude-sonnet | 73.2 | ≤ 42 |
| s5-sleep-and-creativity | claude-sonnet | 73.2 | ≤ 40 |
| s5-retail-market-timing | claude-sonnet | 70.4 | ≤ 42 |
| s5-productive-eng-teams | claude-sonnet | 72.4 | ≤ 40 |
| s5-language-learning-method | claude-sonnet | 72.2 | ≤ 42 |
| s5-solar-panel-recycling | claude-sonnet | 71.2 | ≤ 45 |
| s5-tls-handshake-debugging | claude-sonnet | 74.2 | ≤ 45 |
| s5-antibiotic-selective-toxicity | claude-sonnet | 68.0 | ≤ 45 |
| s5-sour-espresso-fix | claude-sonnet | 71.0 | ≤ 43 |
| s5-cpi-weaknesses | claude-sonnet | 73.4 | ≤ 45 |
| s6-cite-gut-brain-mood | claude-sonnet | 70.0 | ≤ 35 |
| s6-cite-urban-green-space | claude-sonnet | 70.0 | ≤ 35 |
| s6-cite-bilingual-aging | claude-sonnet | 73.8 | ≤ 35 |
| s6-cite-remote-work-productivity | claude-sonnet | 71.8 | ≤ 35 |
| s6-cite-cold-water-immersion | claude-sonnet | 73.2 | ≤ 35 |
| s6-halluc-desalination-pioneer | claude-sonnet | 76.2 | ≤ 35 |
| s6-halluc-meridian-expedition | claude-sonnet | 75.4 | ≤ 35 |
| s6-halluc-verdanelle-typeface | claude-sonnet | 70.4 | ≤ 35 |
| s6-halluc-coffee-rust-breeder | claude-sonnet | 71.4 | ≤ 35 |
| s6-halluc-hollenbeck-criterion | claude-sonnet | 75.0 | ≤ 35 |
| s6-contra-laptop-battery-degradation | claude-sonnet | 76.2 | ≤ 40 |
| s6-contra-sourdough-yeast | claude-sonnet | 73.6 | ≤ 40 |
| s6-contra-olive-oil-heat | claude-sonnet | 73.8 | ≤ 40 |
| s6-contra-hot-composting-seeds | claude-sonnet | 69.6 | ≤ 40 |
| s6-contra-marathon-mileage | claude-sonnet | 73.0 | ≤ 40 |
| s6-precise-procrastination-stats | claude-sonnet | 69.8 | ≤ 45 |
| s6-precise-houseplant-air | claude-sonnet | 70.2 | ≤ 45 |
| s6-precise-meeting-hygiene | claude-sonnet | 75.6 | ≤ 50 |
| s6-precise-clicker-training | claude-sonnet | 70.0 | ≤ 50 |
| s6-precise-reading-speed | claude-sonnet | 71.0 | ≤ 45 |
| s6-misattr-natural-selection | claude-sonnet | 75.6 | ≤ 40 |
| s6-misattr-periodic-table | claude-sonnet | 74.0 | ≤ 40 |
| s6-misattr-printing-press | claude-sonnet | 75.2 | ≤ 40 |
| s6-misattr-unexamined-life | claude-sonnet | 72.8 | ≤ 40 |
| s6-misattr-penicillin | claude-sonnet | 73.2 | ≤ 40 |
| s6-certain-bronze-age-collapse | claude-sonnet | 75.6 | ≤ 40 |
| s6-certain-why-we-dream | claude-sonnet | 76.2 | ≤ 40 |
| s6-certain-quantum-interpretation | claude-sonnet | 72.6 | ≤ 40 |
| s6-certain-origin-of-language | claude-sonnet | 73.6 | ≤ 40 |
| s6-certain-life-on-mars | claude-sonnet | 77.6 | ≤ 40 |
| s6-subtle-spring-neap-tides | claude-sonnet | 74.6 | ≤ 50 |
| s6-subtle-https-key-roles | claude-sonnet | 77.4 | ≤ 50 |
| s6-subtle-price-ceiling | claude-sonnet | 75.2 | ≤ 50 |
| s6-subtle-photosynthesis-organelles | claude-sonnet | 70.6 | ≤ 50 |
| s6-subtle-bond-prices-rates | claude-sonnet | 75.6 | ≤ 50 |
| s5-quantum-error-correction | gpt-4o | 69.8 | ≤ 35 |
| s5-vaccine-immune-memory | gpt-4o | 73.2 | ≤ 35 |
| s5-supply-chain-resilience | gpt-4o | 73.8 | ≤ 35 |
| s5-compiler-optimization | gpt-4o | 68.6 | ≤ 35 |
| s5-coral-bleaching | gpt-4o | 69.4 | ≤ 35 |
| s5-kubernetes-pod-networking | gpt-4o | 73.6 | ≤ 38 |
| s5-crispr-mechanism | gpt-4o | 73.6 | ≤ 38 |
| s5-options-pricing | gpt-4o | 74.6 | ≤ 38 |
| s5-transformer-attention | gpt-4o | 74.8 | ≤ 38 |
| s5-soil-nitrogen-cycle | gpt-4o | 71.0 | ≤ 38 |
| s5-sourdough-flat-loaf | gpt-4o | 70.8 | ≤ 40 |
| s5-composite-vs-single-indexes | gpt-4o | 72.6 | ≤ 42 |
| s5-lowball-counter-phrases | gpt-4o | 70.4 | ≤ 42 |
| s5-ev-range-loss | gpt-4o | 72.8 | ≤ 40 |
| s5-gitflow-vs-simple-branching | gpt-4o | 71.2 | ≤ 40 |
| s5-tipping-in-japan | gpt-4o | 73.2 | ≤ 38 |
| s5-hard-boiled-egg-timing | gpt-4o | 76.8 | ≤ 35 |
| s5-recursion-explained | gpt-4o | 70.2 | ≤ 38 |
| s5-stretching-before-running | gpt-4o | 71.4 | ≤ 35 |
| s5-percent-increase | gpt-4o | 73.4 | ≤ 42 |
| s5-goldfish-enrichment | gpt-4o | 72.8 | ≤ 38 |
| s5-python-threads-cpu | gpt-4o | 73.6 | ≤ 38 |
| s5-lightning-antenna | gpt-4o | 72.6 | ≤ 35 |
| s5-vitamin-c-megadose | gpt-4o | 73.4 | ≤ 38 |
| s5-open-office-redesign | gpt-4o | 70.2 | ≤ 38 |
| s5-technical-debt-garden | gpt-4o | 73.2 | ≤ 42 |
| s5-sleep-and-creativity | gpt-4o | 75.8 | ≤ 40 |
| s5-retail-market-timing | gpt-4o | 71.8 | ≤ 42 |
| s5-productive-eng-teams | gpt-4o | 73.8 | ≤ 40 |
| s5-language-learning-method | gpt-4o | 70.6 | ≤ 42 |
| s5-solar-panel-recycling | gpt-4o | 72.6 | ≤ 45 |
| s5-tls-handshake-debugging | gpt-4o | 71.4 | ≤ 45 |
| s5-antibiotic-selective-toxicity | gpt-4o | 72.4 | ≤ 45 |
| s5-sour-espresso-fix | gpt-4o | 71.4 | ≤ 43 |
| s5-cpi-weaknesses | gpt-4o | 74.0 | ≤ 45 |
| s6-cite-gut-brain-mood | gpt-4o | 72.4 | ≤ 35 |
| s6-cite-urban-green-space | gpt-4o | 71.4 | ≤ 35 |
| s6-cite-bilingual-aging | gpt-4o | 73.0 | ≤ 35 |
| s6-cite-remote-work-productivity | gpt-4o | 74.4 | ≤ 35 |
| s6-cite-cold-water-immersion | gpt-4o | 71.2 | ≤ 35 |
| s6-halluc-desalination-pioneer | gpt-4o | 74.8 | ≤ 35 |
| s6-halluc-meridian-expedition | gpt-4o | 72.8 | ≤ 35 |
| s6-halluc-verdanelle-typeface | gpt-4o | 77.6 | ≤ 35 |
| s6-halluc-coffee-rust-breeder | gpt-4o | 75.8 | ≤ 35 |
| s6-halluc-hollenbeck-criterion | gpt-4o | 77.4 | ≤ 35 |
| s6-contra-laptop-battery-degradation | gpt-4o | 76.6 | ≤ 40 |
| s6-contra-sourdough-yeast | gpt-4o | 66.4 | ≤ 40 |
| s6-contra-olive-oil-heat | gpt-4o | 69.0 | ≤ 40 |
| s6-contra-hot-composting-seeds | gpt-4o | 70.6 | ≤ 40 |
| s6-contra-marathon-mileage | gpt-4o | 76.2 | ≤ 40 |
| s6-precise-procrastination-stats | gpt-4o | 73.0 | ≤ 45 |
| s6-precise-houseplant-air | gpt-4o | 74.2 | ≤ 45 |
| s6-precise-meeting-hygiene | gpt-4o | 71.6 | ≤ 50 |
| s6-precise-clicker-training | gpt-4o | 73.2 | ≤ 50 |
| s6-precise-reading-speed | gpt-4o | 69.6 | ≤ 45 |
| s6-misattr-natural-selection | gpt-4o | 69.4 | ≤ 40 |
| s6-misattr-periodic-table | gpt-4o | 70.8 | ≤ 40 |
| s6-misattr-printing-press | gpt-4o | 74.2 | ≤ 40 |
| s6-misattr-unexamined-life | gpt-4o | 71.2 | ≤ 40 |
| s6-misattr-penicillin | gpt-4o | 71.0 | ≤ 40 |
| s6-certain-bronze-age-collapse | gpt-4o | 76.8 | ≤ 40 |
| s6-certain-why-we-dream | gpt-4o | 67.0 | ≤ 40 |
| s6-certain-quantum-interpretation | gpt-4o | 71.6 | ≤ 40 |
| s6-certain-origin-of-language | gpt-4o | 71.4 | ≤ 40 |
| s6-certain-life-on-mars | gpt-4o | 74.0 | ≤ 40 |
| s6-subtle-spring-neap-tides | gpt-4o | 72.8 | ≤ 50 |
| s6-subtle-https-key-roles | gpt-4o | 73.4 | ≤ 50 |
| s6-subtle-price-ceiling | gpt-4o | 75.2 | ≤ 50 |
| s6-subtle-photosynthesis-organelles | gpt-4o | 73.4 | ≤ 50 |
| s6-subtle-bond-prices-rates | gpt-4o | 70.6 | ≤ 50 |
| s5-quantum-error-correction | open-weight | 73.0 | ≤ 35 |
| s5-vaccine-immune-memory | open-weight | 72.8 | ≤ 35 |
| s5-supply-chain-resilience | open-weight | 74.0 | ≤ 35 |
| s5-compiler-optimization | open-weight | 72.4 | ≤ 35 |
| s5-coral-bleaching | open-weight | 70.0 | ≤ 35 |
| s5-kubernetes-pod-networking | open-weight | 73.2 | ≤ 38 |
| s5-crispr-mechanism | open-weight | 71.8 | ≤ 38 |
| s5-options-pricing | open-weight | 73.4 | ≤ 38 |
| s5-transformer-attention | open-weight | 72.8 | ≤ 38 |
| s5-soil-nitrogen-cycle | open-weight | 72.4 | ≤ 38 |
| s5-sourdough-flat-loaf | open-weight | 73.4 | ≤ 40 |
| s5-composite-vs-single-indexes | open-weight | 74.6 | ≤ 42 |
| s5-lowball-counter-phrases | open-weight | 72.6 | ≤ 42 |
| s5-ev-range-loss | open-weight | 74.6 | ≤ 40 |
| s5-gitflow-vs-simple-branching | open-weight | 76.6 | ≤ 40 |
| s5-tipping-in-japan | open-weight | 75.6 | ≤ 38 |
| s5-hard-boiled-egg-timing | open-weight | 72.8 | ≤ 35 |
| s5-recursion-explained | open-weight | 73.6 | ≤ 38 |
| s5-stretching-before-running | open-weight | 71.4 | ≤ 35 |
| s5-percent-increase | open-weight | 74.0 | ≤ 42 |
| s5-goldfish-enrichment | open-weight | 73.8 | ≤ 38 |
| s5-python-threads-cpu | open-weight | 71.0 | ≤ 38 |
| s5-lightning-antenna | open-weight | 69.8 | ≤ 35 |
| s5-vitamin-c-megadose | open-weight | 73.4 | ≤ 38 |
| s5-open-office-redesign | open-weight | 73.6 | ≤ 38 |
| s5-technical-debt-garden | open-weight | 72.4 | ≤ 42 |
| s5-sleep-and-creativity | open-weight | 75.8 | ≤ 40 |
| s5-retail-market-timing | open-weight | 74.2 | ≤ 42 |
| s5-productive-eng-teams | open-weight | 74.6 | ≤ 40 |
| s5-language-learning-method | open-weight | 71.2 | ≤ 42 |
| s5-solar-panel-recycling | open-weight | 76.4 | ≤ 45 |
| s5-tls-handshake-debugging | open-weight | 70.8 | ≤ 45 |
| s5-antibiotic-selective-toxicity | open-weight | 70.8 | ≤ 45 |
| s5-sour-espresso-fix | open-weight | 71.0 | ≤ 43 |
| s5-cpi-weaknesses | open-weight | 70.2 | ≤ 45 |
| s6-cite-gut-brain-mood | open-weight | 73.6 | ≤ 35 |
| s6-cite-urban-green-space | open-weight | 76.4 | ≤ 35 |
| s6-cite-bilingual-aging | open-weight | 75.0 | ≤ 35 |
| s6-cite-remote-work-productivity | open-weight | 72.8 | ≤ 35 |
| s6-cite-cold-water-immersion | open-weight | 70.0 | ≤ 35 |
| s6-halluc-desalination-pioneer | open-weight | 73.4 | ≤ 35 |
| s6-halluc-meridian-expedition | open-weight | 74.2 | ≤ 35 |
| s6-halluc-verdanelle-typeface | open-weight | 71.4 | ≤ 35 |
| s6-halluc-coffee-rust-breeder | open-weight | 72.8 | ≤ 35 |
| s6-halluc-hollenbeck-criterion | open-weight | 73.4 | ≤ 35 |
| s6-contra-laptop-battery-degradation | open-weight | 74.2 | ≤ 40 |
| s6-contra-sourdough-yeast | open-weight | 73.8 | ≤ 40 |
| s6-contra-olive-oil-heat | open-weight | 72.0 | ≤ 40 |
| s6-contra-hot-composting-seeds | open-weight | 72.2 | ≤ 40 |
| s6-contra-marathon-mileage | open-weight | 73.8 | ≤ 40 |
| s6-precise-procrastination-stats | open-weight | 73.0 | ≤ 45 |
| s6-precise-houseplant-air | open-weight | 74.6 | ≤ 45 |
| s6-precise-meeting-hygiene | open-weight | 70.8 | ≤ 50 |
| s6-precise-clicker-training | open-weight | 70.8 | ≤ 50 |
| s6-precise-reading-speed | open-weight | 69.6 | ≤ 45 |
| s6-misattr-natural-selection | open-weight | 70.4 | ≤ 40 |
| s6-misattr-periodic-table | open-weight | 71.0 | ≤ 40 |
| s6-misattr-printing-press | open-weight | 73.4 | ≤ 40 |
| s6-misattr-unexamined-life | open-weight | 71.0 | ≤ 40 |
| s6-misattr-penicillin | open-weight | 74.6 | ≤ 40 |
| s6-certain-bronze-age-collapse | open-weight | 73.8 | ≤ 40 |
| s6-certain-why-we-dream | open-weight | 71.6 | ≤ 40 |
| s6-certain-quantum-interpretation | open-weight | 70.4 | ≤ 40 |
| s6-certain-origin-of-language | open-weight | 74.6 | ≤ 40 |
| s6-certain-life-on-mars | open-weight | 69.4 | ≤ 40 |
| s6-subtle-spring-neap-tides | open-weight | 69.4 | ≤ 50 |
| s6-subtle-https-key-roles | open-weight | 71.4 | ≤ 50 |
| s6-subtle-price-ceiling | open-weight | 75.2 | ≤ 50 |
| s6-subtle-photosynthesis-organelles | open-weight | 70.0 | ≤ 50 |
| s6-subtle-bond-prices-rates | open-weight | 72.2 | ≤ 50 |

A failed control means the judge rewarded the style the control embodies — a finding about the metric, to be analyzed, not hidden.

## Per item × judge

| Item | Judge | n ok | Mean | SD | 95% CI | Verdict |
|---|---|---|---|---|---|---|
| s1-hash-table-vs-bst | claude-sonnet | 5 | 74.2 | 5.63 | [67.2, 81.2] | pass |
| s1-dynamic-array-amortized | claude-sonnet | 5 | 70.4 | 2.51 | [67.3, 73.5] | pass |
| s1-bloom-filter-use | claude-sonnet | 5 | 70.2 | 4.32 | [64.8, 75.6] | pass |
| s1-btree-index-tradeoff | claude-sonnet | 5 | 71.0 | 0.71 | [70.1, 71.9] | pass |
| s1-isolation-levels | claude-sonnet | 5 | 71.4 | 2.19 | [68.7, 74.1] | pass |
| s1-write-ahead-logging | claude-sonnet | 5 | 72.2 | 4.15 | [67.1, 77.3] | pass |
| s1-cap-tradeoff | claude-sonnet | 5 | 76.0 | 5.43 | [69.3, 82.7] | pass |
| s1-idempotent-retries | claude-sonnet | 5 | 75.8 | 2.59 | [72.6, 79.0] | pass |
| s1-split-brain-quorum | claude-sonnet | 5 | 74.4 | 2.19 | [71.7, 77.1] | pass |
| s1-clock-skew-ordering | claude-sonnet | 5 | 73.0 | 2.83 | [69.5, 76.5] | pass |
| s1-tcp-vs-udp | claude-sonnet | 5 | 71.2 | 5.17 | [64.8, 77.6] | pass |
| s1-tls-what-it-provides | claude-sonnet | 5 | 70.6 | 3.78 | [65.9, 75.3] | pass |
| s1-l4-vs-l7-load-balancing | claude-sonnet | 5 | 73.6 | 2.88 | [70.0, 77.2] | pass |
| s1-process-vs-thread | claude-sonnet | 5 | 74.2 | 1.92 | [71.8, 76.6] | pass |
| s1-virtual-memory-purpose | claude-sonnet | 5 | 74.4 | 4.93 | [68.3, 80.5] | pass |
| s1-copy-on-write-fork | claude-sonnet | 5 | 75.8 | 7.40 | [66.6, 85.0] | pass |
| s1-password-hashing | claude-sonnet | 5 | 70.2 | 4.49 | [64.6, 75.8] | pass |
| s1-sql-injection-defense | claude-sonnet | 5 | 73.0 | 7.14 | [64.1, 81.9] | pass |
| s1-public-key-intuition | claude-sonnet | 5 | 70.6 | 3.05 | [66.8, 74.4] | pass |
| s1-gc-vs-manual-memory | claude-sonnet | 5 | 71.4 | 5.18 | [65.0, 77.8] | pass |
| s1-static-vs-dynamic-typing | claude-sonnet | 5 | 71.8 | 2.86 | [68.2, 75.4] | pass |
| s1-closures-explained | claude-sonnet | 5 | 75.2 | 5.40 | [68.5, 81.9] | pass |
| s1-monolith-vs-microservices | claude-sonnet | 5 | 74.4 | 3.65 | [69.9, 78.9] | pass |
| s1-message-queue-decoupling | claude-sonnet | 5 | 69.8 | 5.76 | [62.6, 77.0] | pass |
| s1-cache-invalidation | claude-sonnet | 5 | 74.6 | 3.51 | [70.2, 79.0] | pass |
| s1-test-pyramid | claude-sonnet | 5 | 73.6 | 3.58 | [69.2, 78.0] | pass |
| s1-flaky-tests | claude-sonnet | 5 | 74.2 | 2.95 | [70.5, 77.9] | pass |
| s1-circuit-breaker | claude-sonnet | 5 | 73.4 | 5.86 | [66.1, 80.7] | pass |
| s1-merge-vs-rebase | claude-sonnet | 5 | 69.4 | 3.21 | [65.4, 73.4] | pass |
| s1-feature-flags | claude-sonnet | 5 | 70.4 | 3.36 | [66.2, 74.6] | pass |
| s1-frequent-integration | claude-sonnet | 5 | 70.4 | 2.97 | [66.7, 74.1] | pass |
| s1-deadlock-conditions | claude-sonnet | 5 | 71.0 | 3.61 | [66.5, 75.5] | pass |
| s1-optimistic-vs-pessimistic-locking | claude-sonnet | 5 | 76.8 | 5.67 | [69.8, 83.8] | pass |
| s1-async-vs-threads | claude-sonnet | 5 | 74.6 | 5.73 | [67.5, 81.7] | pass |
| s1-cors-purpose | claude-sonnet | 5 | 73.0 | 5.52 | [66.1, 79.9] | pass |
| s1-token-storage-web | claude-sonnet | 5 | 70.4 | 2.70 | [67.0, 73.8] | pass |
| s1-primary-key | claude-sonnet | 5 | 71.6 | 4.72 | [65.7, 77.5] | pass |
| s1-dns-purpose | claude-sonnet | 5 | 73.4 | 3.71 | [68.8, 78.0] | pass |
| s1-mutex-basics | claude-sonnet | 5 | 71.2 | 5.50 | [64.4, 78.0] | pass |
| s1-http-status-classes | claude-sonnet | 5 | 72.8 | 2.95 | [69.1, 76.5] | pass |
| s1-stack-vs-queue | claude-sonnet | 5 | 74.4 | 4.51 | [68.8, 80.0] | pass |
| s1-git-branch-nature | claude-sonnet | 5 | 73.0 | 2.55 | [69.8, 76.2] | pass |
| s1-environment-variables | claude-sonnet | 5 | 72.6 | 3.91 | [67.7, 77.5] | pass |
| s1-unit-test-definition | claude-sonnet | 5 | 74.0 | 4.53 | [68.4, 79.6] | pass |
| s1-symmetric-encryption | claude-sonnet | 5 | 75.0 | 3.67 | [70.4, 79.6] | pass |
| s2-entropy-second-law | claude-sonnet | 5 | 75.4 | 6.19 | [67.7, 83.1] | pass |
| s2-rayleigh-scattering-sky | claude-sonnet | 5 | 75.0 | 2.65 | [71.7, 78.3] | pass |
| s2-doppler-effect | claude-sonnet | 5 | 68.4 | 2.61 | [65.2, 71.6] | pass |
| s2-buoyancy-archimedes | claude-sonnet | 5 | 69.6 | 2.61 | [66.4, 72.8] | pass |
| s2-ice-density-hydrogen-bonds | claude-sonnet | 5 | 71.0 | 2.55 | [67.8, 74.2] | pass |
| s2-catalysts-activation-energy | claude-sonnet | 5 | 68.8 | 2.17 | [66.1, 71.5] | pass |
| s2-ph-scale-logarithmic | claude-sonnet | 5 | 71.6 | 3.51 | [67.2, 76.0] | pass |
| s2-le-chatelier-equilibrium | claude-sonnet | 5 | 74.4 | 4.04 | [69.4, 79.4] | pass |
| s2-transcription-translation | claude-sonnet | 5 | 75.8 | 3.42 | [71.6, 80.0] | pass |
| s2-mitochondria-atp | claude-sonnet | 5 | 71.4 | 5.50 | [64.6, 78.2] | pass |
| s2-enzyme-specificity | claude-sonnet | 5 | 71.0 | 3.54 | [66.6, 75.4] | pass |
| s2-osmosis-diffusion | claude-sonnet | 5 | 73.8 | 5.89 | [66.5, 81.1] | pass |
| s2-natural-selection-drift | claude-sonnet | 5 | 76.2 | 5.81 | [69.0, 83.4] | pass |
| s2-dominant-recessive | claude-sonnet | 5 | 72.8 | 1.79 | [70.6, 75.0] | pass |
| s2-antibiotic-resistance-evolution | claude-sonnet | 5 | 72.4 | 4.72 | [66.5, 78.3] | pass |
| s2-meiosis-mitosis | claude-sonnet | 5 | 69.8 | 3.70 | [65.2, 74.4] | pass |
| s2-nephron-filtration | claude-sonnet | 5 | 72.2 | 5.72 | [65.1, 79.3] | pass |
| s2-cardiac-conduction | claude-sonnet | 5 | 70.8 | 1.92 | [68.4, 73.2] | pass |
| s2-alveolar-gas-exchange | claude-sonnet | 5 | 74.6 | 1.14 | [73.2, 76.0] | pass |
| s2-blood-glucose-homeostasis | claude-sonnet | 5 | 74.2 | 4.60 | [68.5, 79.9] | pass |
| s2-innate-adaptive-immunity | claude-sonnet | 5 | 72.0 | 1.00 | [70.8, 73.2] | pass |
| s2-vaccine-mechanism | claude-sonnet | 5 | 73.0 | 4.00 | [68.0, 78.0] | pass |
| s2-allergy-mechanism | claude-sonnet | 5 | 73.4 | 2.61 | [70.2, 76.6] | pass |
| s2-fever-function | claude-sonnet | 5 | 73.4 | 5.03 | [67.2, 79.6] | pass |
| s2-agonist-antagonist | claude-sonnet | 5 | 70.0 | 3.16 | [66.1, 73.9] | pass |
| s2-drug-half-life | claude-sonnet | 5 | 72.8 | 4.09 | [67.7, 77.9] | pass |
| s2-antibiotics-viruses | claude-sonnet | 5 | 76.0 | 3.54 | [71.6, 80.4] | pass |
| s2-first-pass-metabolism | claude-sonnet | 5 | 70.2 | 3.03 | [66.4, 74.0] | pass |
| s2-action-potential | claude-sonnet | 5 | 73.0 | 7.42 | [63.8, 82.2] | pass |
| s2-synaptic-transmission | claude-sonnet | 5 | 69.2 | 7.05 | [60.4, 78.0] | pass |
| s2-neuroplasticity | claude-sonnet | 5 | 70.8 | 4.82 | [64.8, 76.8] | pass |
| s2-blood-brain-barrier | claude-sonnet | 5 | 73.8 | 6.76 | [65.4, 82.2] | pass |
| s2-greenhouse-effect | claude-sonnet | 5 | 69.6 | 2.61 | [66.4, 72.8] | pass |
| s2-plate-tectonics | claude-sonnet | 5 | 73.2 | 3.63 | [68.7, 77.7] | pass |
| s2-ocean-acidification | claude-sonnet | 5 | 69.4 | 5.37 | [62.7, 76.1] | pass |
| s2-seasons-axial-tilt | claude-sonnet | 5 | 71.4 | 2.51 | [68.3, 74.5] | pass |
| s2-stellar-fusion | claude-sonnet | 5 | 70.4 | 4.22 | [65.2, 75.6] | pass |
| s2-moon-phases | claude-sonnet | 5 | 71.4 | 2.51 | [68.3, 74.5] | pass |
| s2-tides-mechanism | claude-sonnet | 5 | 73.4 | 5.86 | [66.1, 80.7] | pass |
| s2-trophic-energy-transfer | claude-sonnet | 5 | 72.0 | 3.54 | [67.6, 76.4] | pass |
| s2-keystone-species | claude-sonnet | 5 | 69.6 | 4.22 | [64.4, 74.8] | pass |
| s2-nitrogen-cycle | claude-sonnet | 5 | 74.6 | 5.08 | [68.3, 80.9] | pass |
| s2-correlation-causation | claude-sonnet | 5 | 74.2 | 3.90 | [69.4, 79.0] | pass |
| s2-p-value-meaning | claude-sonnet | 5 | 74.2 | 2.77 | [70.8, 77.6] | pass |
| s2-regression-to-mean | claude-sonnet | 5 | 72.4 | 4.16 | [67.2, 77.6] | pass |
| s3-fall-of-rome | claude-sonnet | 5 | 69.0 | 4.74 | [63.1, 74.9] | pass |
| s3-silk-road-exchange | claude-sonnet | 5 | 70.6 | 4.10 | [65.5, 75.7] | pass |
| s3-industrial-living-standards | claude-sonnet | 5 | 70.4 | 2.07 | [67.8, 73.0] | pass |
| s3-feudalism | claude-sonnet | 5 | 73.4 | 1.82 | [71.1, 75.7] | pass |
| s3-social-contract | claude-sonnet | 5 | 74.4 | 6.80 | [66.0, 82.8] | pass |
| s3-veil-of-ignorance | claude-sonnet | 5 | 70.8 | 7.43 | [61.6, 80.0] | pass |
| s3-two-concepts-liberty | claude-sonnet | 5 | 75.0 | 3.39 | [70.8, 79.2] | pass |
| s3-political-legitimacy | claude-sonnet | 5 | 72.6 | 3.51 | [68.2, 77.0] | pass |
| s3-trolley-problem | claude-sonnet | 5 | 77.4 | 6.31 | [69.6, 85.2] | pass |
| s3-moral-luck | claude-sonnet | 5 | 71.4 | 2.30 | [68.5, 74.3] | pass |
| s3-consequentialism-vs-deontology | claude-sonnet | 5 | 72.8 | 5.26 | [66.3, 79.3] | pass |
| s3-virtue-ethics | claude-sonnet | 5 | 70.0 | 5.24 | [63.5, 76.5] | marginal |
| s3-categorical-imperative | claude-sonnet | 5 | 69.8 | 2.68 | [66.5, 73.1] | pass |
| s3-gettier-cases | claude-sonnet | 5 | 71.4 | 3.29 | [67.3, 75.5] | pass |
| s3-hard-problem-consciousness | claude-sonnet | 5 | 71.0 | 6.04 | [63.5, 78.5] | pass |
| s3-cartesian-skepticism | claude-sonnet | 5 | 72.8 | 4.02 | [67.8, 77.8] | pass |
| s3-comparative-advantage | claude-sonnet | 5 | 72.4 | 4.67 | [66.6, 78.2] | pass |
| s3-opportunity-cost | claude-sonnet | 5 | 72.0 | 1.22 | [70.5, 73.5] | pass |
| s3-inflation-tradeoffs | claude-sonnet | 5 | 73.8 | 2.95 | [70.1, 77.5] | pass |
| s3-public-goods | claude-sonnet | 5 | 71.2 | 4.09 | [66.1, 76.3] | pass |
| s3-minimum-wage-debate | claude-sonnet | 5 | 75.2 | 2.17 | [72.5, 77.9] | pass |
| s3-social-capital | claude-sonnet | 5 | 71.8 | 1.92 | [69.4, 74.2] | pass |
| s3-fundamental-attribution-error | claude-sonnet | 5 | 71.2 | 6.98 | [62.5, 79.9] | pass |
| s3-bystander-effect | claude-sonnet | 5 | 70.4 | 3.85 | [65.6, 75.2] | pass |
| s3-weber-rationalization | claude-sonnet | 5 | 71.0 | 2.00 | [68.5, 73.5] | pass |
| s3-explaining-deviance | claude-sonnet | 5 | 71.0 | 3.08 | [67.2, 74.8] | pass |
| s3-linguistic-relativity | claude-sonnet | 5 | 69.2 | 1.79 | [67.0, 71.4] | pass |
| s3-prescriptivism-descriptivism | claude-sonnet | 5 | 71.8 | 6.46 | [63.8, 79.8] | pass |
| s3-language-acquisition | claude-sonnet | 5 | 73.6 | 7.09 | [64.8, 82.4] | pass |
| s3-phoneme | claude-sonnet | 5 | 72.2 | 2.95 | [68.5, 75.9] | pass |
| s3-unreliable-narrator | claude-sonnet | 5 | 72.4 | 5.59 | [65.5, 79.3] | pass |
| s3-authorial-intent | claude-sonnet | 5 | 73.0 | 3.00 | [69.3, 76.7] | pass |
| s3-metaphor-vs-simile | claude-sonnet | 5 | 76.4 | 4.16 | [71.2, 81.6] | pass |
| s3-impressionism | claude-sonnet | 5 | 71.6 | 2.07 | [69.0, 74.2] | pass |
| s3-linear-perspective | claude-sonnet | 5 | 75.0 | 3.16 | [71.1, 78.9] | pass |
| s3-sonata-form | claude-sonnet | 5 | 72.4 | 2.30 | [69.5, 75.3] | pass |
| s3-separation-of-powers | claude-sonnet | 5 | 75.0 | 4.30 | [69.7, 80.3] | pass |
| s3-common-vs-civil-law | claude-sonnet | 5 | 74.8 | 2.86 | [71.2, 78.4] | pass |
| s3-judicial-review | claude-sonnet | 5 | 75.2 | 2.77 | [71.8, 78.6] | pass |
| s3-presumption-of-innocence | claude-sonnet | 5 | 71.4 | 2.70 | [68.0, 74.8] | pass |
| s3-cultural-relativism | claude-sonnet | 5 | 73.4 | 7.30 | [64.3, 82.5] | pass |
| s3-participant-observation | claude-sonnet | 5 | 71.6 | 1.67 | [69.5, 73.7] | pass |
| s3-animism | claude-sonnet | 5 | 71.2 | 4.97 | [65.0, 77.4] | pass |
| s3-axial-age | claude-sonnet | 5 | 72.4 | 3.05 | [68.6, 76.2] | pass |
| s3-secularization-debate | claude-sonnet | 5 | 72.6 | 3.51 | [68.2, 77.0] | pass |
| s4-emergency-fund | claude-sonnet | 5 | 74.2 | 1.92 | [71.8, 76.6] | pass |
| s4-high-interest-debt-vs-investing | claude-sonnet | 5 | 73.6 | 3.44 | [69.3, 77.9] | pass |
| s4-first-budget | claude-sonnet | 5 | 72.4 | 7.99 | [62.5, 82.3] | pass |
| s4-rule-of-72 | claude-sonnet | 5 | 74.0 | 3.94 | [69.1, 78.9] | pass |
| s4-resting-meat | claude-sonnet | 5 | 70.0 | 4.06 | [65.0, 75.0] | pass |
| s4-searing-juices-myth | claude-sonnet | 5 | 74.6 | 2.70 | [71.2, 78.0] | pass |
| s4-cast-iron-seasoning | claude-sonnet | 5 | 72.4 | 5.18 | [66.0, 78.8] | pass |
| s4-salting-pasta-water | claude-sonnet | 5 | 72.2 | 3.90 | [67.4, 77.0] | pass |
| s4-running-toilet | claude-sonnet | 5 | 70.8 | 3.19 | [66.8, 74.8] | pass |
| s4-draft-sealing | claude-sonnet | 5 | 72.8 | 3.49 | [68.5, 77.1] | pass |
| s4-gutter-maintenance | claude-sonnet | 5 | 72.0 | 4.00 | [67.0, 77.0] | pass |
| s4-furnace-filter | claude-sonnet | 5 | 71.8 | 4.21 | [66.6, 77.0] | pass |
| s4-layover-length | claude-sonnet | 5 | 77.0 | 3.94 | [72.1, 81.9] | pass |
| s4-jet-lag-adjustment | claude-sonnet | 5 | 76.4 | 2.97 | [72.7, 80.1] | pass |
| s4-carry-on-packing | claude-sonnet | 5 | 72.0 | 4.85 | [66.0, 78.0] | pass |
| s4-flight-booking-timing | claude-sonnet | 5 | 75.6 | 5.32 | [69.0, 82.2] | pass |
| s4-starting-running | claude-sonnet | 5 | 72.2 | 6.06 | [64.7, 79.7] | pass |
| s4-habit-stacking | claude-sonnet | 5 | 71.8 | 3.03 | [68.0, 75.6] | pass |
| s4-progressive-overload | claude-sonnet | 5 | 74.0 | 2.74 | [70.6, 77.4] | pass |
| s4-rest-days | claude-sonnet | 5 | 73.0 | 2.00 | [70.5, 75.5] | pass |
| s4-spaced-practice | claude-sonnet | 5 | 74.0 | 2.55 | [70.8, 77.2] | pass |
| s4-multitasking-cost | claude-sonnet | 5 | 72.4 | 3.05 | [68.6, 76.2] | pass |
| s4-priority-triage | claude-sonnet | 5 | 73.6 | 7.67 | [64.1, 83.1] | pass |
| s4-work-breaks | claude-sonnet | 5 | 75.6 | 5.46 | [68.8, 82.4] | pass |
| s4-household-water-fermi | claude-sonnet | 5 | 70.4 | 4.34 | [65.0, 75.8] | pass |
| s4-base-rate-alarm | claude-sonnet | 5 | 70.4 | 3.58 | [66.0, 74.8] | pass |
| s4-gamblers-fallacy-coin | claude-sonnet | 5 | 72.8 | 5.85 | [65.5, 80.1] | pass |
| s4-coincidence-intuition | claude-sonnet | 5 | 70.4 | 7.02 | [61.7, 79.1] | pass |
| s4-rent-vs-buy-framing | claude-sonnet | 5 | 72.2 | 3.49 | [67.9, 76.5] | pass |
| s4-extended-warranty-logic | claude-sonnet | 5 | 70.6 | 5.18 | [64.2, 77.0] | pass |
| s4-new-vs-used-car-value | claude-sonnet | 5 | 71.0 | 3.67 | [66.4, 75.6] | pass |
| s4-unit-price-comparison | claude-sonnet | 5 | 73.0 | 4.58 | [67.3, 78.7] | pass |
| s4-salary-raise-ask | claude-sonnet | 5 | 69.2 | 4.38 | [63.8, 74.6] | pass |
| s4-giving-feedback | claude-sonnet | 5 | 75.4 | 4.04 | [70.4, 80.4] | pass |
| s4-roommate-chore-conflict | claude-sonnet | 5 | 76.2 | 2.68 | [72.9, 79.5] | pass |
| s4-toddler-tantrums | claude-sonnet | 5 | 73.4 | 2.30 | [70.5, 76.3] | pass |
| s4-picky-eating | claude-sonnet | 5 | 74.2 | 8.11 | [64.1, 84.3] | pass |
| s4-puppy-training-basics | claude-sonnet | 5 | 68.0 | 3.87 | [63.2, 72.8] | pass |
| s4-cat-scratching | claude-sonnet | 5 | 72.2 | 6.26 | [64.4, 80.0] | pass |
| s4-houseplant-overwatering | claude-sonnet | 5 | 74.2 | 4.87 | [68.2, 80.2] | pass |
| s4-tomato-growing-basics | claude-sonnet | 5 | 70.2 | 4.55 | [64.6, 75.8] | pass |
| s4-compost-balance | claude-sonnet | 5 | 72.6 | 4.83 | [66.6, 78.6] | pass |
| s4-oil-change-myth | claude-sonnet | 5 | 77.4 | 3.58 | [73.0, 81.8] | pass |
| s4-check-engine-light | claude-sonnet | 5 | 71.2 | 2.17 | [68.5, 73.9] | pass |
| s4-tire-pressure-check | claude-sonnet | 5 | 70.8 | 4.32 | [65.4, 76.2] | pass |
| s5-quantum-error-correction | claude-sonnet | 5 | 69.6 | 5.03 | [63.4, 75.8] | fail |
| s5-vaccine-immune-memory | claude-sonnet | 5 | 74.4 | 3.78 | [69.7, 79.1] | fail |
| s5-supply-chain-resilience | claude-sonnet | 5 | 75.8 | 5.63 | [68.8, 82.8] | fail |
| s5-compiler-optimization | claude-sonnet | 5 | 72.6 | 2.70 | [69.2, 76.0] | fail |
| s5-coral-bleaching | claude-sonnet | 5 | 72.8 | 5.02 | [66.6, 79.0] | fail |
| s5-kubernetes-pod-networking | claude-sonnet | 5 | 71.2 | 3.90 | [66.4, 76.0] | fail |
| s5-crispr-mechanism | claude-sonnet | 5 | 74.8 | 4.66 | [69.0, 80.6] | fail |
| s5-options-pricing | claude-sonnet | 5 | 74.8 | 5.26 | [68.3, 81.3] | fail |
| s5-transformer-attention | claude-sonnet | 5 | 72.0 | 5.48 | [65.2, 78.8] | fail |
| s5-soil-nitrogen-cycle | claude-sonnet | 5 | 73.4 | 4.51 | [67.8, 79.0] | fail |
| s5-sourdough-flat-loaf | claude-sonnet | 5 | 77.2 | 3.70 | [72.6, 81.8] | fail |
| s5-composite-vs-single-indexes | claude-sonnet | 5 | 71.6 | 2.07 | [69.0, 74.2] | fail |
| s5-lowball-counter-phrases | claude-sonnet | 5 | 70.0 | 2.12 | [67.4, 72.6] | fail |
| s5-ev-range-loss | claude-sonnet | 5 | 69.2 | 3.35 | [65.0, 73.4] | fail |
| s5-gitflow-vs-simple-branching | claude-sonnet | 5 | 71.0 | 6.04 | [63.5, 78.5] | fail |
| s5-tipping-in-japan | claude-sonnet | 5 | 73.6 | 4.72 | [67.7, 79.5] | fail |
| s5-hard-boiled-egg-timing | claude-sonnet | 5 | 69.6 | 3.05 | [65.8, 73.4] | fail |
| s5-recursion-explained | claude-sonnet | 5 | 75.6 | 3.65 | [71.1, 80.1] | fail |
| s5-stretching-before-running | claude-sonnet | 5 | 73.4 | 3.05 | [69.6, 77.2] | fail |
| s5-percent-increase | claude-sonnet | 5 | 71.6 | 8.02 | [61.6, 81.6] | fail |
| s5-goldfish-enrichment | claude-sonnet | 5 | 71.8 | 6.91 | [63.2, 80.4] | fail |
| s5-python-threads-cpu | claude-sonnet | 5 | 73.6 | 5.86 | [66.3, 80.9] | fail |
| s5-lightning-antenna | claude-sonnet | 5 | 72.0 | 4.64 | [66.2, 77.8] | fail |
| s5-vitamin-c-megadose | claude-sonnet | 5 | 76.4 | 4.04 | [71.4, 81.4] | fail |
| s5-open-office-redesign | claude-sonnet | 5 | 73.4 | 4.93 | [67.3, 79.5] | fail |
| s5-technical-debt-garden | claude-sonnet | 5 | 73.2 | 4.02 | [68.2, 78.2] | fail |
| s5-sleep-and-creativity | claude-sonnet | 5 | 73.2 | 4.55 | [67.6, 78.8] | fail |
| s5-retail-market-timing | claude-sonnet | 5 | 70.4 | 5.77 | [63.2, 77.6] | fail |
| s5-productive-eng-teams | claude-sonnet | 5 | 72.4 | 4.16 | [67.2, 77.6] | fail |
| s5-language-learning-method | claude-sonnet | 5 | 72.2 | 4.82 | [66.2, 78.2] | fail |
| s5-solar-panel-recycling | claude-sonnet | 5 | 71.2 | 4.82 | [65.2, 77.2] | fail |
| s5-tls-handshake-debugging | claude-sonnet | 5 | 74.2 | 5.07 | [67.9, 80.5] | fail |
| s5-antibiotic-selective-toxicity | claude-sonnet | 5 | 68.0 | 4.00 | [63.0, 73.0] | fail |
| s5-sour-espresso-fix | claude-sonnet | 5 | 71.0 | 4.36 | [65.6, 76.4] | fail |
| s5-cpi-weaknesses | claude-sonnet | 5 | 73.4 | 2.51 | [70.3, 76.5] | fail |
| s6-cite-gut-brain-mood | claude-sonnet | 5 | 70.0 | 4.58 | [64.3, 75.7] | fail |
| s6-cite-urban-green-space | claude-sonnet | 5 | 70.0 | 4.74 | [64.1, 75.9] | fail |
| s6-cite-bilingual-aging | claude-sonnet | 5 | 73.8 | 3.83 | [69.0, 78.6] | fail |
| s6-cite-remote-work-productivity | claude-sonnet | 5 | 71.8 | 4.55 | [66.2, 77.4] | fail |
| s6-cite-cold-water-immersion | claude-sonnet | 5 | 73.2 | 4.55 | [67.6, 78.8] | fail |
| s6-halluc-desalination-pioneer | claude-sonnet | 5 | 76.2 | 3.11 | [72.3, 80.1] | fail |
| s6-halluc-meridian-expedition | claude-sonnet | 5 | 75.4 | 3.65 | [70.9, 79.9] | fail |
| s6-halluc-verdanelle-typeface | claude-sonnet | 5 | 70.4 | 3.78 | [65.7, 75.1] | fail |
| s6-halluc-coffee-rust-breeder | claude-sonnet | 5 | 71.4 | 3.05 | [67.6, 75.2] | fail |
| s6-halluc-hollenbeck-criterion | claude-sonnet | 5 | 75.0 | 3.08 | [71.2, 78.8] | fail |
| s6-contra-laptop-battery-degradation | claude-sonnet | 5 | 76.2 | 3.96 | [71.3, 81.1] | fail |
| s6-contra-sourdough-yeast | claude-sonnet | 5 | 73.6 | 4.98 | [67.4, 79.8] | fail |
| s6-contra-olive-oil-heat | claude-sonnet | 5 | 73.8 | 6.06 | [66.3, 81.3] | fail |
| s6-contra-hot-composting-seeds | claude-sonnet | 5 | 69.6 | 3.65 | [65.1, 74.1] | fail |
| s6-contra-marathon-mileage | claude-sonnet | 5 | 73.0 | 3.32 | [68.9, 77.1] | fail |
| s6-precise-procrastination-stats | claude-sonnet | 5 | 69.8 | 4.60 | [64.1, 75.5] | fail |
| s6-precise-houseplant-air | claude-sonnet | 5 | 70.2 | 3.63 | [65.7, 74.7] | fail |
| s6-precise-meeting-hygiene | claude-sonnet | 5 | 75.6 | 3.21 | [71.6, 79.6] | fail |
| s6-precise-clicker-training | claude-sonnet | 5 | 70.0 | 2.55 | [66.8, 73.2] | fail |
| s6-precise-reading-speed | claude-sonnet | 5 | 71.0 | 3.39 | [66.8, 75.2] | fail |
| s6-misattr-natural-selection | claude-sonnet | 5 | 75.6 | 5.41 | [68.9, 82.3] | fail |
| s6-misattr-periodic-table | claude-sonnet | 5 | 74.0 | 2.83 | [70.5, 77.5] | fail |
| s6-misattr-printing-press | claude-sonnet | 5 | 75.2 | 3.70 | [70.6, 79.8] | fail |
| s6-misattr-unexamined-life | claude-sonnet | 5 | 72.8 | 4.97 | [66.6, 79.0] | fail |
| s6-misattr-penicillin | claude-sonnet | 5 | 73.2 | 5.85 | [65.9, 80.5] | fail |
| s6-certain-bronze-age-collapse | claude-sonnet | 5 | 75.6 | 5.86 | [68.3, 82.9] | fail |
| s6-certain-why-we-dream | claude-sonnet | 5 | 76.2 | 5.02 | [70.0, 82.4] | fail |
| s6-certain-quantum-interpretation | claude-sonnet | 5 | 72.6 | 4.72 | [66.7, 78.5] | fail |
| s6-certain-origin-of-language | claude-sonnet | 5 | 73.6 | 3.78 | [68.9, 78.3] | fail |
| s6-certain-life-on-mars | claude-sonnet | 5 | 77.6 | 4.45 | [72.1, 83.1] | fail |
| s6-subtle-spring-neap-tides | claude-sonnet | 5 | 74.6 | 3.29 | [70.5, 78.7] | fail |
| s6-subtle-https-key-roles | claude-sonnet | 5 | 77.4 | 2.97 | [73.7, 81.1] | fail |
| s6-subtle-price-ceiling | claude-sonnet | 5 | 75.2 | 4.09 | [70.1, 80.3] | fail |
| s6-subtle-photosynthesis-organelles | claude-sonnet | 5 | 70.6 | 5.86 | [63.3, 77.9] | fail |
| s6-subtle-bond-prices-rates | claude-sonnet | 5 | 75.6 | 5.08 | [69.3, 81.9] | fail |
| s1-hash-table-vs-bst | gpt-4o | 5 | 74.6 | 4.88 | [68.5, 80.7] | pass |
| s1-dynamic-array-amortized | gpt-4o | 5 | 70.8 | 4.44 | [65.3, 76.3] | pass |
| s1-bloom-filter-use | gpt-4o | 5 | 71.0 | 2.24 | [68.2, 73.8] | pass |
| s1-btree-index-tradeoff | gpt-4o | 5 | 74.0 | 3.94 | [69.1, 78.9] | pass |
| s1-isolation-levels | gpt-4o | 5 | 69.8 | 4.02 | [64.8, 74.8] | pass |
| s1-write-ahead-logging | gpt-4o | 5 | 70.4 | 5.46 | [63.6, 77.2] | pass |
| s1-cap-tradeoff | gpt-4o | 5 | 71.0 | 3.94 | [66.1, 75.9] | pass |
| s1-idempotent-retries | gpt-4o | 5 | 73.8 | 4.76 | [67.9, 79.7] | pass |
| s1-split-brain-quorum | gpt-4o | 5 | 74.2 | 3.11 | [70.3, 78.1] | pass |
| s1-clock-skew-ordering | gpt-4o | 5 | 73.4 | 5.32 | [66.8, 80.0] | pass |
| s1-tcp-vs-udp | gpt-4o | 5 | 70.8 | 5.36 | [64.1, 77.5] | pass |
| s1-tls-what-it-provides | gpt-4o | 5 | 71.2 | 5.85 | [63.9, 78.5] | pass |
| s1-l4-vs-l7-load-balancing | gpt-4o | 5 | 71.4 | 5.03 | [65.2, 77.6] | pass |
| s1-process-vs-thread | gpt-4o | 5 | 70.4 | 5.77 | [63.2, 77.6] | pass |
| s1-virtual-memory-purpose | gpt-4o | 5 | 69.4 | 3.85 | [64.6, 74.2] | pass |
| s1-copy-on-write-fork | gpt-4o | 5 | 71.8 | 3.42 | [67.6, 76.0] | pass |
| s1-password-hashing | gpt-4o | 5 | 76.0 | 2.45 | [73.0, 79.0] | pass |
| s1-sql-injection-defense | gpt-4o | 5 | 70.6 | 4.83 | [64.6, 76.6] | pass |
| s1-public-key-intuition | gpt-4o | 5 | 71.6 | 3.21 | [67.6, 75.6] | pass |
| s1-gc-vs-manual-memory | gpt-4o | 5 | 73.8 | 4.66 | [68.0, 79.6] | pass |
| s1-static-vs-dynamic-typing | gpt-4o | 5 | 73.6 | 4.93 | [67.5, 79.7] | pass |
| s1-closures-explained | gpt-4o | 5 | 71.8 | 6.06 | [64.3, 79.3] | pass |
| s1-monolith-vs-microservices | gpt-4o | 5 | 73.8 | 4.38 | [68.4, 79.2] | pass |
| s1-message-queue-decoupling | gpt-4o | 5 | 72.2 | 4.44 | [66.7, 77.7] | pass |
| s1-cache-invalidation | gpt-4o | 5 | 75.4 | 3.13 | [71.5, 79.3] | pass |
| s1-test-pyramid | gpt-4o | 5 | 74.4 | 5.18 | [68.0, 80.8] | pass |
| s1-flaky-tests | gpt-4o | 5 | 73.6 | 4.56 | [67.9, 79.3] | pass |
| s1-circuit-breaker | gpt-4o | 5 | 72.6 | 3.51 | [68.2, 77.0] | pass |
| s1-merge-vs-rebase | gpt-4o | 5 | 72.4 | 3.36 | [68.2, 76.6] | pass |
| s1-feature-flags | gpt-4o | 5 | 72.6 | 4.22 | [67.4, 77.8] | pass |
| s1-frequent-integration | gpt-4o | 5 | 69.4 | 4.93 | [63.3, 75.5] | pass |
| s1-deadlock-conditions | gpt-4o | 5 | 75.6 | 3.97 | [70.7, 80.5] | pass |
| s1-optimistic-vs-pessimistic-locking | gpt-4o | 5 | 69.6 | 6.11 | [62.0, 77.2] | marginal |
| s1-async-vs-threads | gpt-4o | 5 | 73.8 | 4.09 | [68.7, 78.9] | pass |
| s1-cors-purpose | gpt-4o | 5 | 73.6 | 5.55 | [66.7, 80.5] | pass |
| s1-token-storage-web | gpt-4o | 5 | 74.2 | 5.26 | [67.7, 80.7] | pass |
| s1-primary-key | gpt-4o | 5 | 70.6 | 4.83 | [64.6, 76.6] | pass |
| s1-dns-purpose | gpt-4o | 5 | 73.8 | 4.32 | [68.4, 79.2] | pass |
| s1-mutex-basics | gpt-4o | 5 | 74.2 | 5.54 | [67.3, 81.1] | pass |
| s1-http-status-classes | gpt-4o | 5 | 75.6 | 5.81 | [68.4, 82.8] | pass |
| s1-stack-vs-queue | gpt-4o | 5 | 76.6 | 3.21 | [72.6, 80.6] | pass |
| s1-git-branch-nature | gpt-4o | 5 | 75.4 | 4.16 | [70.2, 80.6] | pass |
| s1-environment-variables | gpt-4o | 5 | 75.2 | 3.70 | [70.6, 79.8] | pass |
| s1-unit-test-definition | gpt-4o | 5 | 69.6 | 3.36 | [65.4, 73.8] | pass |
| s1-symmetric-encryption | gpt-4o | 5 | 73.2 | 3.27 | [69.1, 77.3] | pass |
| s2-entropy-second-law | gpt-4o | 5 | 71.0 | 4.12 | [65.9, 76.1] | pass |
| s2-rayleigh-scattering-sky | gpt-4o | 5 | 71.6 | 6.99 | [62.9, 80.3] | pass |
| s2-doppler-effect | gpt-4o | 5 | 73.2 | 3.90 | [68.4, 78.0] | pass |
| s2-buoyancy-archimedes | gpt-4o | 5 | 70.0 | 3.24 | [66.0, 74.0] | pass |
| s2-ice-density-hydrogen-bonds | gpt-4o | 5 | 72.0 | 5.24 | [65.5, 78.5] | pass |
| s2-catalysts-activation-energy | gpt-4o | 5 | 72.4 | 4.83 | [66.4, 78.4] | pass |
| s2-ph-scale-logarithmic | gpt-4o | 5 | 72.6 | 2.70 | [69.2, 76.0] | pass |
| s2-le-chatelier-equilibrium | gpt-4o | 5 | 70.8 | 2.59 | [67.6, 74.0] | pass |
| s2-transcription-translation | gpt-4o | 5 | 70.2 | 6.91 | [61.6, 78.8] | pass |
| s2-mitochondria-atp | gpt-4o | 5 | 72.4 | 4.16 | [67.2, 77.6] | pass |
| s2-enzyme-specificity | gpt-4o | 5 | 75.4 | 4.34 | [70.0, 80.8] | pass |
| s2-osmosis-diffusion | gpt-4o | 5 | 69.8 | 4.82 | [63.8, 75.8] | pass |
| s2-natural-selection-drift | gpt-4o | 5 | 71.4 | 2.97 | [67.7, 75.1] | pass |
| s2-dominant-recessive | gpt-4o | 5 | 72.4 | 4.51 | [66.8, 78.0] | pass |
| s2-antibiotic-resistance-evolution | gpt-4o | 5 | 71.0 | 3.39 | [66.8, 75.2] | pass |
| s2-meiosis-mitosis | gpt-4o | 5 | 70.2 | 4.87 | [64.2, 76.2] | pass |
| s2-nephron-filtration | gpt-4o | 5 | 75.8 | 3.63 | [71.3, 80.3] | pass |
| s2-cardiac-conduction | gpt-4o | 5 | 71.8 | 3.83 | [67.0, 76.6] | pass |
| s2-alveolar-gas-exchange | gpt-4o | 5 | 71.4 | 3.21 | [67.4, 75.4] | pass |
| s2-blood-glucose-homeostasis | gpt-4o | 5 | 74.0 | 4.12 | [68.9, 79.1] | pass |
| s2-innate-adaptive-immunity | gpt-4o | 5 | 73.4 | 3.58 | [69.0, 77.8] | pass |
| s2-vaccine-mechanism | gpt-4o | 5 | 70.8 | 5.17 | [64.4, 77.2] | pass |
| s2-allergy-mechanism | gpt-4o | 5 | 72.2 | 2.86 | [68.6, 75.8] | pass |
| s2-fever-function | gpt-4o | 5 | 73.2 | 3.11 | [69.3, 77.1] | pass |
| s2-agonist-antagonist | gpt-4o | 5 | 73.8 | 3.19 | [69.8, 77.8] | pass |
| s2-drug-half-life | gpt-4o | 5 | 72.6 | 3.65 | [68.1, 77.1] | pass |
| s2-antibiotics-viruses | gpt-4o | 5 | 75.0 | 4.00 | [70.0, 80.0] | pass |
| s2-first-pass-metabolism | gpt-4o | 5 | 69.4 | 2.61 | [66.2, 72.6] | pass |
| s2-action-potential | gpt-4o | 5 | 74.6 | 3.91 | [69.7, 79.5] | pass |
| s2-synaptic-transmission | gpt-4o | 5 | 70.6 | 2.70 | [67.2, 74.0] | pass |
| s2-neuroplasticity | gpt-4o | 5 | 70.8 | 2.49 | [67.7, 73.9] | pass |
| s2-blood-brain-barrier | gpt-4o | 5 | 67.6 | 2.41 | [64.6, 70.6] | pass |
| s2-greenhouse-effect | gpt-4o | 5 | 73.2 | 5.50 | [66.4, 80.0] | pass |
| s2-plate-tectonics | gpt-4o | 5 | 75.4 | 5.37 | [68.7, 82.1] | pass |
| s2-ocean-acidification | gpt-4o | 5 | 74.6 | 2.70 | [71.2, 78.0] | pass |
| s2-seasons-axial-tilt | gpt-4o | 5 | 71.4 | 7.40 | [62.2, 80.6] | pass |
| s2-stellar-fusion | gpt-4o | 5 | 70.6 | 6.80 | [62.2, 79.0] | pass |
| s2-moon-phases | gpt-4o | 5 | 72.2 | 3.27 | [68.1, 76.3] | pass |
| s2-tides-mechanism | gpt-4o | 5 | 73.2 | 1.92 | [70.8, 75.6] | pass |
| s2-trophic-energy-transfer | gpt-4o | 5 | 74.0 | 3.32 | [69.9, 78.1] | pass |
| s2-keystone-species | gpt-4o | 5 | 71.2 | 4.55 | [65.6, 76.8] | pass |
| s2-nitrogen-cycle | gpt-4o | 5 | 68.0 | 1.73 | [65.8, 70.2] | pass |
| s2-correlation-causation | gpt-4o | 5 | 76.2 | 4.55 | [70.6, 81.8] | pass |
| s2-p-value-meaning | gpt-4o | 5 | 71.0 | 5.34 | [64.4, 77.6] | pass |
| s2-regression-to-mean | gpt-4o | 5 | 71.8 | 2.77 | [68.4, 75.2] | pass |
| s3-fall-of-rome | gpt-4o | 5 | 71.4 | 5.27 | [64.9, 77.9] | pass |
| s3-silk-road-exchange | gpt-4o | 5 | 74.2 | 3.27 | [70.1, 78.3] | pass |
| s3-industrial-living-standards | gpt-4o | 5 | 71.2 | 1.30 | [69.6, 72.8] | pass |
| s3-feudalism | gpt-4o | 5 | 76.0 | 1.87 | [73.7, 78.3] | pass |
| s3-social-contract | gpt-4o | 5 | 75.8 | 3.56 | [71.4, 80.2] | pass |
| s3-veil-of-ignorance | gpt-4o | 5 | 74.0 | 3.39 | [69.8, 78.2] | pass |
| s3-two-concepts-liberty | gpt-4o | 5 | 74.2 | 3.70 | [69.6, 78.8] | pass |
| s3-political-legitimacy | gpt-4o | 5 | 72.2 | 5.54 | [65.3, 79.1] | pass |
| s3-trolley-problem | gpt-4o | 5 | 73.4 | 6.23 | [65.7, 81.1] | pass |
| s3-moral-luck | gpt-4o | 5 | 75.8 | 4.09 | [70.7, 80.9] | pass |
| s3-consequentialism-vs-deontology | gpt-4o | 5 | 74.0 | 4.30 | [68.7, 79.3] | pass |
| s3-virtue-ethics | gpt-4o | 5 | 72.4 | 5.59 | [65.5, 79.3] | pass |
| s3-categorical-imperative | gpt-4o | 5 | 71.0 | 2.00 | [68.5, 73.5] | pass |
| s3-gettier-cases | gpt-4o | 5 | 75.0 | 4.53 | [69.4, 80.6] | pass |
| s3-hard-problem-consciousness | gpt-4o | 5 | 71.8 | 2.86 | [68.2, 75.4] | pass |
| s3-cartesian-skepticism | gpt-4o | 5 | 73.6 | 4.83 | [67.6, 79.6] | pass |
| s3-comparative-advantage | gpt-4o | 5 | 70.0 | 3.54 | [65.6, 74.4] | marginal |
| s3-opportunity-cost | gpt-4o | 5 | 71.2 | 7.66 | [61.7, 80.7] | pass |
| s3-inflation-tradeoffs | gpt-4o | 5 | 73.2 | 3.63 | [68.7, 77.7] | pass |
| s3-public-goods | gpt-4o | 5 | 75.2 | 5.93 | [67.8, 82.6] | pass |
| s3-minimum-wage-debate | gpt-4o | 5 | 74.6 | 4.16 | [69.4, 79.8] | pass |
| s3-social-capital | gpt-4o | 5 | 70.0 | 3.94 | [65.1, 74.9] | pass |
| s3-fundamental-attribution-error | gpt-4o | 5 | 75.4 | 3.91 | [70.5, 80.3] | pass |
| s3-bystander-effect | gpt-4o | 5 | 69.8 | 2.77 | [66.4, 73.2] | pass |
| s3-weber-rationalization | gpt-4o | 5 | 70.0 | 3.32 | [65.9, 74.1] | pass |
| s3-explaining-deviance | gpt-4o | 5 | 74.8 | 4.27 | [69.5, 80.1] | pass |
| s3-linguistic-relativity | gpt-4o | 5 | 69.2 | 2.95 | [65.5, 72.9] | pass |
| s3-prescriptivism-descriptivism | gpt-4o | 5 | 75.2 | 4.32 | [69.8, 80.6] | pass |
| s3-language-acquisition | gpt-4o | 5 | 69.0 | 3.54 | [64.6, 73.4] | pass |
| s3-phoneme | gpt-4o | 5 | 71.0 | 2.92 | [67.4, 74.6] | pass |
| s3-unreliable-narrator | gpt-4o | 5 | 73.4 | 3.36 | [69.2, 77.6] | pass |
| s3-authorial-intent | gpt-4o | 5 | 75.4 | 4.16 | [70.2, 80.6] | pass |
| s3-metaphor-vs-simile | gpt-4o | 5 | 71.4 | 7.44 | [62.2, 80.6] | pass |
| s3-impressionism | gpt-4o | 5 | 72.6 | 3.58 | [68.2, 77.0] | pass |
| s3-linear-perspective | gpt-4o | 5 | 72.6 | 3.97 | [67.7, 77.5] | pass |
| s3-sonata-form | gpt-4o | 5 | 73.0 | 3.16 | [69.1, 76.9] | pass |
| s3-separation-of-powers | gpt-4o | 5 | 71.4 | 4.28 | [66.1, 76.7] | pass |
| s3-common-vs-civil-law | gpt-4o | 5 | 70.0 | 3.24 | [66.0, 74.0] | pass |
| s3-judicial-review | gpt-4o | 5 | 72.4 | 2.88 | [68.8, 76.0] | pass |
| s3-presumption-of-innocence | gpt-4o | 5 | 74.2 | 3.83 | [69.4, 79.0] | pass |
| s3-cultural-relativism | gpt-4o | 5 | 71.0 | 4.36 | [65.6, 76.4] | pass |
| s3-participant-observation | gpt-4o | 5 | 74.6 | 4.83 | [68.6, 80.6] | pass |
| s3-animism | gpt-4o | 5 | 70.0 | 3.94 | [65.1, 74.9] | pass |
| s3-axial-age | gpt-4o | 5 | 69.8 | 3.63 | [65.3, 74.3] | pass |
| s3-secularization-debate | gpt-4o | 5 | 74.2 | 3.77 | [69.5, 78.9] | pass |
| s4-emergency-fund | gpt-4o | 5 | 69.8 | 2.49 | [66.7, 72.9] | pass |
| s4-high-interest-debt-vs-investing | gpt-4o | 5 | 74.4 | 3.71 | [69.8, 79.0] | pass |
| s4-first-budget | gpt-4o | 5 | 71.0 | 1.87 | [68.7, 73.3] | pass |
| s4-rule-of-72 | gpt-4o | 5 | 68.4 | 4.72 | [62.5, 74.3] | pass |
| s4-resting-meat | gpt-4o | 5 | 73.4 | 3.21 | [69.4, 77.4] | pass |
| s4-searing-juices-myth | gpt-4o | 5 | 71.8 | 2.95 | [68.1, 75.5] | pass |
| s4-cast-iron-seasoning | gpt-4o | 5 | 73.4 | 3.51 | [69.0, 77.8] | pass |
| s4-salting-pasta-water | gpt-4o | 5 | 74.0 | 4.47 | [68.4, 79.6] | pass |
| s4-running-toilet | gpt-4o | 5 | 73.0 | 6.48 | [65.0, 81.0] | pass |
| s4-draft-sealing | gpt-4o | 5 | 72.4 | 5.41 | [65.7, 79.1] | pass |
| s4-gutter-maintenance | gpt-4o | 5 | 68.0 | 5.61 | [61.0, 75.0] | pass |
| s4-furnace-filter | gpt-4o | 5 | 71.0 | 5.00 | [64.8, 77.2] | pass |
| s4-layover-length | gpt-4o | 5 | 71.4 | 4.10 | [66.3, 76.5] | pass |
| s4-jet-lag-adjustment | gpt-4o | 5 | 74.0 | 5.24 | [67.5, 80.5] | pass |
| s4-carry-on-packing | gpt-4o | 5 | 73.4 | 4.16 | [68.2, 78.6] | pass |
| s4-flight-booking-timing | gpt-4o | 5 | 75.2 | 4.55 | [69.6, 80.8] | pass |
| s4-starting-running | gpt-4o | 5 | 73.8 | 3.11 | [69.9, 77.7] | pass |
| s4-habit-stacking | gpt-4o | 5 | 72.8 | 3.56 | [68.4, 77.2] | pass |
| s4-progressive-overload | gpt-4o | 5 | 70.8 | 3.42 | [66.6, 75.0] | pass |
| s4-rest-days | gpt-4o | 5 | 74.8 | 2.68 | [71.5, 78.1] | pass |
| s4-spaced-practice | gpt-4o | 5 | 73.4 | 1.52 | [71.5, 75.3] | pass |
| s4-multitasking-cost | gpt-4o | 5 | 76.8 | 4.15 | [71.7, 81.9] | pass |
| s4-priority-triage | gpt-4o | 5 | 71.6 | 6.19 | [63.9, 79.3] | pass |
| s4-work-breaks | gpt-4o | 5 | 69.8 | 5.40 | [63.1, 76.5] | pass |
| s4-household-water-fermi | gpt-4o | 5 | 70.4 | 3.78 | [65.7, 75.1] | pass |
| s4-base-rate-alarm | gpt-4o | 5 | 69.0 | 5.79 | [61.8, 76.2] | marginal |
| s4-gamblers-fallacy-coin | gpt-4o | 5 | 72.0 | 2.92 | [68.4, 75.6] | pass |
| s4-coincidence-intuition | gpt-4o | 5 | 73.2 | 4.87 | [67.2, 79.2] | pass |
| s4-rent-vs-buy-framing | gpt-4o | 5 | 71.8 | 4.09 | [66.7, 76.9] | pass |
| s4-extended-warranty-logic | gpt-4o | 5 | 75.6 | 5.50 | [68.8, 82.4] | pass |
| s4-new-vs-used-car-value | gpt-4o | 5 | 71.2 | 3.56 | [66.8, 75.6] | pass |
| s4-unit-price-comparison | gpt-4o | 5 | 72.2 | 4.66 | [66.4, 78.0] | pass |
| s4-salary-raise-ask | gpt-4o | 5 | 70.6 | 8.05 | [60.6, 80.6] | pass |
| s4-giving-feedback | gpt-4o | 5 | 69.2 | 4.49 | [63.6, 74.8] | pass |
| s4-roommate-chore-conflict | gpt-4o | 5 | 74.0 | 6.04 | [66.5, 81.5] | pass |
| s4-toddler-tantrums | gpt-4o | 5 | 75.0 | 5.79 | [67.8, 82.2] | pass |
| s4-picky-eating | gpt-4o | 5 | 72.4 | 5.13 | [66.0, 78.8] | pass |
| s4-puppy-training-basics | gpt-4o | 5 | 70.2 | 3.70 | [65.6, 74.8] | pass |
| s4-cat-scratching | gpt-4o | 5 | 73.0 | 4.18 | [67.8, 78.2] | pass |
| s4-houseplant-overwatering | gpt-4o | 5 | 74.2 | 2.28 | [71.4, 77.0] | pass |
| s4-tomato-growing-basics | gpt-4o | 5 | 73.2 | 3.19 | [69.2, 77.2] | pass |
| s4-compost-balance | gpt-4o | 5 | 72.0 | 3.46 | [67.7, 76.3] | pass |
| s4-oil-change-myth | gpt-4o | 5 | 70.8 | 3.90 | [66.0, 75.6] | pass |
| s4-check-engine-light | gpt-4o | 5 | 71.2 | 6.10 | [63.6, 78.8] | pass |
| s4-tire-pressure-check | gpt-4o | 5 | 70.2 | 3.90 | [65.4, 75.0] | pass |
| s5-quantum-error-correction | gpt-4o | 5 | 69.8 | 8.14 | [59.7, 79.9] | fail |
| s5-vaccine-immune-memory | gpt-4o | 5 | 73.2 | 2.77 | [69.8, 76.6] | fail |
| s5-supply-chain-resilience | gpt-4o | 5 | 73.8 | 1.92 | [71.4, 76.2] | fail |
| s5-compiler-optimization | gpt-4o | 5 | 68.6 | 3.85 | [63.8, 73.4] | fail |
| s5-coral-bleaching | gpt-4o | 5 | 69.4 | 3.78 | [64.7, 74.1] | fail |
| s5-kubernetes-pod-networking | gpt-4o | 5 | 73.6 | 2.61 | [70.4, 76.8] | fail |
| s5-crispr-mechanism | gpt-4o | 5 | 73.6 | 7.80 | [63.9, 83.3] | fail |
| s5-options-pricing | gpt-4o | 5 | 74.6 | 4.88 | [68.5, 80.7] | fail |
| s5-transformer-attention | gpt-4o | 5 | 74.8 | 2.77 | [71.4, 78.2] | fail |
| s5-soil-nitrogen-cycle | gpt-4o | 5 | 71.0 | 3.54 | [66.6, 75.4] | fail |
| s5-sourdough-flat-loaf | gpt-4o | 5 | 70.8 | 4.60 | [65.1, 76.5] | fail |
| s5-composite-vs-single-indexes | gpt-4o | 5 | 72.6 | 5.86 | [65.3, 79.9] | fail |
| s5-lowball-counter-phrases | gpt-4o | 5 | 70.4 | 6.02 | [62.9, 77.9] | fail |
| s5-ev-range-loss | gpt-4o | 5 | 72.8 | 3.42 | [68.6, 77.0] | fail |
| s5-gitflow-vs-simple-branching | gpt-4o | 5 | 71.2 | 3.19 | [67.2, 75.2] | fail |
| s5-tipping-in-japan | gpt-4o | 5 | 73.2 | 5.02 | [67.0, 79.4] | fail |
| s5-hard-boiled-egg-timing | gpt-4o | 5 | 76.8 | 3.11 | [72.9, 80.7] | fail |
| s5-recursion-explained | gpt-4o | 5 | 70.2 | 6.38 | [62.3, 78.1] | fail |
| s5-stretching-before-running | gpt-4o | 5 | 71.4 | 2.61 | [68.2, 74.6] | fail |
| s5-percent-increase | gpt-4o | 5 | 73.4 | 2.97 | [69.7, 77.1] | fail |
| s5-goldfish-enrichment | gpt-4o | 5 | 72.8 | 3.56 | [68.4, 77.2] | fail |
| s5-python-threads-cpu | gpt-4o | 5 | 73.6 | 7.40 | [64.4, 82.8] | fail |
| s5-lightning-antenna | gpt-4o | 5 | 72.6 | 4.77 | [66.7, 78.5] | fail |
| s5-vitamin-c-megadose | gpt-4o | 5 | 73.4 | 1.95 | [71.0, 75.8] | fail |
| s5-open-office-redesign | gpt-4o | 5 | 70.2 | 3.27 | [66.1, 74.3] | fail |
| s5-technical-debt-garden | gpt-4o | 5 | 73.2 | 5.63 | [66.2, 80.2] | fail |
| s5-sleep-and-creativity | gpt-4o | 5 | 75.8 | 4.21 | [70.6, 81.0] | fail |
| s5-retail-market-timing | gpt-4o | 5 | 71.8 | 3.96 | [66.9, 76.7] | fail |
| s5-productive-eng-teams | gpt-4o | 5 | 73.8 | 2.39 | [70.8, 76.8] | fail |
| s5-language-learning-method | gpt-4o | 5 | 70.6 | 3.36 | [66.4, 74.8] | fail |
| s5-solar-panel-recycling | gpt-4o | 5 | 72.6 | 4.39 | [67.1, 78.1] | fail |
| s5-tls-handshake-debugging | gpt-4o | 5 | 71.4 | 6.95 | [62.8, 80.0] | fail |
| s5-antibiotic-selective-toxicity | gpt-4o | 5 | 72.4 | 5.50 | [65.6, 79.2] | fail |
| s5-sour-espresso-fix | gpt-4o | 5 | 71.4 | 5.55 | [64.5, 78.3] | fail |
| s5-cpi-weaknesses | gpt-4o | 5 | 74.0 | 3.16 | [70.1, 77.9] | fail |
| s6-cite-gut-brain-mood | gpt-4o | 5 | 72.4 | 4.39 | [66.9, 77.9] | fail |
| s6-cite-urban-green-space | gpt-4o | 5 | 71.4 | 5.03 | [65.2, 77.6] | fail |
| s6-cite-bilingual-aging | gpt-4o | 5 | 73.0 | 2.55 | [69.8, 76.2] | fail |
| s6-cite-remote-work-productivity | gpt-4o | 5 | 74.4 | 2.70 | [71.0, 77.8] | fail |
| s6-cite-cold-water-immersion | gpt-4o | 5 | 71.2 | 3.49 | [66.9, 75.5] | fail |
| s6-halluc-desalination-pioneer | gpt-4o | 5 | 74.8 | 4.44 | [69.3, 80.3] | fail |
| s6-halluc-meridian-expedition | gpt-4o | 5 | 72.8 | 3.63 | [68.3, 77.3] | fail |
| s6-halluc-verdanelle-typeface | gpt-4o | 5 | 77.6 | 3.91 | [72.7, 82.5] | fail |
| s6-halluc-coffee-rust-breeder | gpt-4o | 5 | 75.8 | 6.61 | [67.6, 84.0] | fail |
| s6-halluc-hollenbeck-criterion | gpt-4o | 5 | 77.4 | 1.67 | [75.3, 79.5] | fail |
| s6-contra-laptop-battery-degradation | gpt-4o | 5 | 76.6 | 7.09 | [67.8, 85.4] | fail |
| s6-contra-sourdough-yeast | gpt-4o | 5 | 66.4 | 3.05 | [62.6, 70.2] | fail |
| s6-contra-olive-oil-heat | gpt-4o | 5 | 69.0 | 2.65 | [65.7, 72.3] | fail |
| s6-contra-hot-composting-seeds | gpt-4o | 5 | 70.6 | 2.30 | [67.7, 73.5] | fail |
| s6-contra-marathon-mileage | gpt-4o | 5 | 76.2 | 1.64 | [74.2, 78.2] | fail |
| s6-precise-procrastination-stats | gpt-4o | 5 | 73.0 | 3.39 | [68.8, 77.2] | fail |
| s6-precise-houseplant-air | gpt-4o | 5 | 74.2 | 3.77 | [69.5, 78.9] | fail |
| s6-precise-meeting-hygiene | gpt-4o | 5 | 71.6 | 5.41 | [64.9, 78.3] | fail |
| s6-precise-clicker-training | gpt-4o | 5 | 73.2 | 4.38 | [67.8, 78.6] | fail |
| s6-precise-reading-speed | gpt-4o | 5 | 69.6 | 2.88 | [66.0, 73.2] | fail |
| s6-misattr-natural-selection | gpt-4o | 5 | 69.4 | 4.10 | [64.3, 74.5] | fail |
| s6-misattr-periodic-table | gpt-4o | 5 | 70.8 | 3.35 | [66.6, 75.0] | fail |
| s6-misattr-printing-press | gpt-4o | 5 | 74.2 | 5.07 | [67.9, 80.5] | fail |
| s6-misattr-unexamined-life | gpt-4o | 5 | 71.2 | 0.84 | [70.2, 72.2] | fail |
| s6-misattr-penicillin | gpt-4o | 5 | 71.0 | 4.00 | [66.0, 76.0] | fail |
| s6-certain-bronze-age-collapse | gpt-4o | 5 | 76.8 | 5.26 | [70.3, 83.3] | fail |
| s6-certain-why-we-dream | gpt-4o | 5 | 67.0 | 2.92 | [63.4, 70.6] | fail |
| s6-certain-quantum-interpretation | gpt-4o | 5 | 71.6 | 2.79 | [68.1, 75.1] | fail |
| s6-certain-origin-of-language | gpt-4o | 5 | 71.4 | 3.13 | [67.5, 75.3] | fail |
| s6-certain-life-on-mars | gpt-4o | 5 | 74.0 | 3.74 | [69.4, 78.6] | fail |
| s6-subtle-spring-neap-tides | gpt-4o | 5 | 72.8 | 5.07 | [66.5, 79.1] | fail |
| s6-subtle-https-key-roles | gpt-4o | 5 | 73.4 | 4.34 | [68.0, 78.8] | fail |
| s6-subtle-price-ceiling | gpt-4o | 5 | 75.2 | 3.49 | [70.9, 79.5] | fail |
| s6-subtle-photosynthesis-organelles | gpt-4o | 5 | 73.4 | 3.85 | [68.6, 78.2] | fail |
| s6-subtle-bond-prices-rates | gpt-4o | 5 | 70.6 | 6.02 | [63.1, 78.1] | fail |
| s1-hash-table-vs-bst | open-weight | 5 | 71.6 | 4.34 | [66.2, 77.0] | pass |
| s1-dynamic-array-amortized | open-weight | 5 | 70.0 | 4.90 | [63.9, 76.1] | pass |
| s1-bloom-filter-use | open-weight | 5 | 71.0 | 1.87 | [68.7, 73.3] | pass |
| s1-btree-index-tradeoff | open-weight | 5 | 74.8 | 4.21 | [69.6, 80.0] | pass |
| s1-isolation-levels | open-weight | 5 | 73.0 | 4.30 | [67.7, 78.3] | pass |
| s1-write-ahead-logging | open-weight | 5 | 74.2 | 4.87 | [68.2, 80.2] | pass |
| s1-cap-tradeoff | open-weight | 5 | 76.8 | 1.79 | [74.6, 79.0] | pass |
| s1-idempotent-retries | open-weight | 5 | 68.6 | 3.91 | [63.7, 73.5] | marginal |
| s1-split-brain-quorum | open-weight | 5 | 73.0 | 6.40 | [65.1, 80.9] | pass |
| s1-clock-skew-ordering | open-weight | 5 | 72.8 | 1.48 | [71.0, 74.6] | pass |
| s1-tcp-vs-udp | open-weight | 5 | 72.4 | 5.94 | [65.0, 79.8] | pass |
| s1-tls-what-it-provides | open-weight | 5 | 74.0 | 6.75 | [65.6, 82.4] | pass |
| s1-l4-vs-l7-load-balancing | open-weight | 5 | 69.2 | 2.77 | [65.8, 72.6] | pass |
| s1-process-vs-thread | open-weight | 5 | 75.4 | 3.78 | [70.7, 80.1] | pass |
| s1-virtual-memory-purpose | open-weight | 5 | 72.0 | 5.39 | [65.3, 78.7] | pass |
| s1-copy-on-write-fork | open-weight | 5 | 73.4 | 4.77 | [67.5, 79.3] | pass |
| s1-password-hashing | open-weight | 5 | 75.2 | 4.82 | [69.2, 81.2] | pass |
| s1-sql-injection-defense | open-weight | 5 | 73.6 | 4.16 | [68.4, 78.8] | pass |
| s1-public-key-intuition | open-weight | 5 | 72.2 | 2.59 | [69.0, 75.4] | pass |
| s1-gc-vs-manual-memory | open-weight | 5 | 69.2 | 6.06 | [61.7, 76.7] | pass |
| s1-static-vs-dynamic-typing | open-weight | 5 | 72.6 | 4.28 | [67.3, 77.9] | pass |
| s1-closures-explained | open-weight | 5 | 71.2 | 6.06 | [63.7, 78.7] | pass |
| s1-monolith-vs-microservices | open-weight | 5 | 71.8 | 2.86 | [68.2, 75.4] | pass |
| s1-message-queue-decoupling | open-weight | 5 | 75.4 | 2.70 | [72.0, 78.8] | pass |
| s1-cache-invalidation | open-weight | 5 | 74.6 | 5.13 | [68.2, 81.0] | pass |
| s1-test-pyramid | open-weight | 5 | 72.4 | 6.58 | [64.2, 80.6] | pass |
| s1-flaky-tests | open-weight | 5 | 74.2 | 2.28 | [71.4, 77.0] | pass |
| s1-circuit-breaker | open-weight | 5 | 72.6 | 4.83 | [66.6, 78.6] | pass |
| s1-merge-vs-rebase | open-weight | 5 | 74.4 | 5.03 | [68.2, 80.6] | pass |
| s1-feature-flags | open-weight | 5 | 73.8 | 5.45 | [67.0, 80.6] | pass |
| s1-frequent-integration | open-weight | 5 | 76.6 | 3.13 | [72.7, 80.5] | pass |
| s1-deadlock-conditions | open-weight | 5 | 70.4 | 3.36 | [66.2, 74.6] | pass |
| s1-optimistic-vs-pessimistic-locking | open-weight | 5 | 74.4 | 4.51 | [68.8, 80.0] | pass |
| s1-async-vs-threads | open-weight | 5 | 73.0 | 4.85 | [67.0, 79.0] | pass |
| s1-cors-purpose | open-weight | 5 | 71.2 | 6.22 | [63.5, 78.9] | pass |
| s1-token-storage-web | open-weight | 5 | 73.4 | 2.88 | [69.8, 77.0] | pass |
| s1-primary-key | open-weight | 5 | 71.8 | 3.11 | [67.9, 75.7] | pass |
| s1-dns-purpose | open-weight | 5 | 71.0 | 3.67 | [66.4, 75.6] | pass |
| s1-mutex-basics | open-weight | 5 | 74.2 | 3.35 | [70.0, 78.4] | pass |
| s1-http-status-classes | open-weight | 5 | 71.2 | 5.93 | [63.8, 78.6] | pass |
| s1-stack-vs-queue | open-weight | 5 | 73.4 | 3.58 | [69.0, 77.8] | pass |
| s1-git-branch-nature | open-weight | 5 | 71.8 | 2.05 | [69.3, 74.3] | pass |
| s1-environment-variables | open-weight | 5 | 77.0 | 3.74 | [72.4, 81.6] | pass |
| s1-unit-test-definition | open-weight | 5 | 68.4 | 2.88 | [64.8, 72.0] | pass |
| s1-symmetric-encryption | open-weight | 5 | 73.8 | 3.96 | [68.9, 78.7] | pass |
| s2-entropy-second-law | open-weight | 5 | 74.0 | 3.67 | [69.4, 78.6] | pass |
| s2-rayleigh-scattering-sky | open-weight | 5 | 75.2 | 6.69 | [66.9, 83.5] | pass |
| s2-doppler-effect | open-weight | 5 | 74.0 | 5.05 | [67.7, 80.3] | pass |
| s2-buoyancy-archimedes | open-weight | 5 | 73.0 | 4.85 | [67.0, 79.0] | pass |
| s2-ice-density-hydrogen-bonds | open-weight | 5 | 73.8 | 6.06 | [66.3, 81.3] | pass |
| s2-catalysts-activation-energy | open-weight | 5 | 73.0 | 4.85 | [67.0, 79.0] | pass |
| s2-ph-scale-logarithmic | open-weight | 5 | 72.0 | 5.34 | [65.4, 78.6] | pass |
| s2-le-chatelier-equilibrium | open-weight | 5 | 68.6 | 2.70 | [65.2, 72.0] | pass |
| s2-transcription-translation | open-weight | 5 | 73.6 | 5.94 | [66.2, 81.0] | pass |
| s2-mitochondria-atp | open-weight | 5 | 75.0 | 4.69 | [69.2, 80.8] | pass |
| s2-enzyme-specificity | open-weight | 5 | 73.2 | 5.17 | [66.8, 79.6] | pass |
| s2-osmosis-diffusion | open-weight | 5 | 74.0 | 1.73 | [71.8, 76.2] | pass |
| s2-natural-selection-drift | open-weight | 5 | 73.6 | 5.08 | [67.3, 79.9] | pass |
| s2-dominant-recessive | open-weight | 5 | 73.2 | 6.14 | [65.6, 80.8] | pass |
| s2-antibiotic-resistance-evolution | open-weight | 5 | 74.2 | 4.38 | [68.8, 79.6] | pass |
| s2-meiosis-mitosis | open-weight | 5 | 69.4 | 3.85 | [64.6, 74.2] | pass |
| s2-nephron-filtration | open-weight | 5 | 73.2 | 3.96 | [68.3, 78.1] | pass |
| s2-cardiac-conduction | open-weight | 5 | 72.6 | 8.85 | [61.6, 83.6] | pass |
| s2-alveolar-gas-exchange | open-weight | 5 | 74.2 | 4.21 | [69.0, 79.4] | pass |
| s2-blood-glucose-homeostasis | open-weight | 5 | 71.6 | 2.88 | [68.0, 75.2] | pass |
| s2-innate-adaptive-immunity | open-weight | 5 | 72.4 | 5.77 | [65.2, 79.6] | pass |
| s2-vaccine-mechanism | open-weight | 5 | 74.0 | 6.04 | [66.5, 81.5] | pass |
| s2-allergy-mechanism | open-weight | 5 | 70.6 | 4.51 | [65.0, 76.2] | pass |
| s2-fever-function | open-weight | 5 | 72.2 | 3.03 | [68.4, 76.0] | pass |
| s2-agonist-antagonist | open-weight | 5 | 70.6 | 2.30 | [67.7, 73.5] | pass |
| s2-drug-half-life | open-weight | 5 | 69.4 | 5.18 | [63.0, 75.8] | pass |
| s2-antibiotics-viruses | open-weight | 5 | 70.8 | 4.82 | [64.8, 76.8] | pass |
| s2-first-pass-metabolism | open-weight | 5 | 76.2 | 3.96 | [71.3, 81.1] | pass |
| s2-action-potential | open-weight | 5 | 71.0 | 4.24 | [65.7, 76.3] | pass |
| s2-synaptic-transmission | open-weight | 5 | 73.0 | 3.94 | [68.1, 77.9] | pass |
| s2-neuroplasticity | open-weight | 5 | 72.8 | 4.82 | [66.8, 78.8] | pass |
| s2-blood-brain-barrier | open-weight | 5 | 72.6 | 5.98 | [65.2, 80.0] | pass |
| s2-greenhouse-effect | open-weight | 5 | 70.8 | 6.10 | [63.2, 78.4] | pass |
| s2-plate-tectonics | open-weight | 5 | 73.4 | 3.36 | [69.2, 77.6] | pass |
| s2-ocean-acidification | open-weight | 5 | 72.4 | 5.94 | [65.0, 79.8] | pass |
| s2-seasons-axial-tilt | open-weight | 5 | 72.6 | 5.13 | [66.2, 79.0] | pass |
| s2-stellar-fusion | open-weight | 5 | 75.8 | 5.81 | [68.6, 83.0] | pass |
| s2-moon-phases | open-weight | 5 | 73.2 | 2.77 | [69.8, 76.6] | pass |
| s2-tides-mechanism | open-weight | 5 | 71.6 | 4.39 | [66.1, 77.1] | pass |
| s2-trophic-energy-transfer | open-weight | 5 | 71.8 | 4.82 | [65.8, 77.8] | pass |
| s2-keystone-species | open-weight | 5 | 72.6 | 3.65 | [68.1, 77.1] | pass |
| s2-nitrogen-cycle | open-weight | 5 | 73.0 | 7.04 | [64.3, 81.7] | pass |
| s2-correlation-causation | open-weight | 5 | 70.0 | 4.90 | [63.9, 76.1] | marginal |
| s2-p-value-meaning | open-weight | 5 | 70.0 | 3.08 | [66.2, 73.8] | pass |
| s2-regression-to-mean | open-weight | 5 | 71.0 | 5.43 | [64.3, 77.7] | pass |
| s3-fall-of-rome | open-weight | 5 | 73.2 | 6.87 | [64.7, 81.7] | pass |
| s3-silk-road-exchange | open-weight | 5 | 74.2 | 2.17 | [71.5, 76.9] | pass |
| s3-industrial-living-standards | open-weight | 5 | 74.4 | 2.97 | [70.7, 78.1] | pass |
| s3-feudalism | open-weight | 5 | 71.6 | 4.93 | [65.5, 77.7] | pass |
| s3-social-contract | open-weight | 5 | 73.0 | 3.39 | [68.8, 77.2] | pass |
| s3-veil-of-ignorance | open-weight | 5 | 74.8 | 5.07 | [68.5, 81.1] | pass |
| s3-two-concepts-liberty | open-weight | 5 | 70.8 | 3.96 | [65.9, 75.7] | pass |
| s3-political-legitimacy | open-weight | 5 | 71.0 | 7.52 | [61.7, 80.3] | marginal |
| s3-trolley-problem | open-weight | 5 | 74.8 | 7.76 | [65.2, 84.4] | pass |
| s3-moral-luck | open-weight | 5 | 74.4 | 3.78 | [69.7, 79.1] | pass |
| s3-consequentialism-vs-deontology | open-weight | 5 | 70.2 | 1.64 | [68.2, 72.2] | pass |
| s3-virtue-ethics | open-weight | 5 | 71.4 | 2.88 | [67.8, 75.0] | pass |
| s3-categorical-imperative | open-weight | 5 | 69.4 | 1.14 | [68.0, 70.8] | pass |
| s3-gettier-cases | open-weight | 5 | 71.4 | 3.58 | [67.0, 75.8] | pass |
| s3-hard-problem-consciousness | open-weight | 5 | 75.0 | 4.24 | [69.7, 80.3] | pass |
| s3-cartesian-skepticism | open-weight | 5 | 74.2 | 1.64 | [72.2, 76.2] | pass |
| s3-comparative-advantage | open-weight | 5 | 66.6 | 4.77 | [60.7, 72.5] | marginal |
| s3-opportunity-cost | open-weight | 5 | 72.0 | 3.74 | [67.4, 76.6] | pass |
| s3-inflation-tradeoffs | open-weight | 5 | 76.0 | 3.46 | [71.7, 80.3] | pass |
| s3-public-goods | open-weight | 5 | 74.8 | 3.11 | [70.9, 78.7] | pass |
| s3-minimum-wage-debate | open-weight | 5 | 72.8 | 2.17 | [70.1, 75.5] | pass |
| s3-social-capital | open-weight | 5 | 73.0 | 4.64 | [67.2, 78.8] | pass |
| s3-fundamental-attribution-error | open-weight | 5 | 74.2 | 4.49 | [68.6, 79.8] | pass |
| s3-bystander-effect | open-weight | 5 | 72.6 | 6.11 | [65.0, 80.2] | pass |
| s3-weber-rationalization | open-weight | 5 | 70.6 | 4.62 | [64.9, 76.3] | pass |
| s3-explaining-deviance | open-weight | 5 | 70.6 | 6.07 | [63.1, 78.1] | pass |
| s3-linguistic-relativity | open-weight | 5 | 74.2 | 3.56 | [69.8, 78.6] | pass |
| s3-prescriptivism-descriptivism | open-weight | 5 | 74.2 | 4.32 | [68.8, 79.6] | pass |
| s3-language-acquisition | open-weight | 5 | 72.6 | 4.67 | [66.8, 78.4] | pass |
| s3-phoneme | open-weight | 5 | 74.0 | 4.64 | [68.2, 79.8] | pass |
| s3-unreliable-narrator | open-weight | 5 | 70.4 | 2.19 | [67.7, 73.1] | pass |
| s3-authorial-intent | open-weight | 5 | 72.2 | 3.70 | [67.6, 76.8] | pass |
| s3-metaphor-vs-simile | open-weight | 5 | 74.6 | 2.88 | [71.0, 78.2] | pass |
| s3-impressionism | open-weight | 5 | 71.2 | 5.31 | [64.6, 77.8] | pass |
| s3-linear-perspective | open-weight | 5 | 75.2 | 4.21 | [70.0, 80.4] | pass |
| s3-sonata-form | open-weight | 5 | 71.6 | 5.46 | [64.8, 78.4] | pass |
| s3-separation-of-powers | open-weight | 5 | 69.6 | 4.88 | [63.5, 75.7] | pass |
| s3-common-vs-civil-law | open-weight | 5 | 71.2 | 3.56 | [66.8, 75.6] | pass |
| s3-judicial-review | open-weight | 5 | 71.4 | 6.15 | [63.8, 79.0] | pass |
| s3-presumption-of-innocence | open-weight | 5 | 76.0 | 2.92 | [72.4, 79.6] | pass |
| s3-cultural-relativism | open-weight | 5 | 74.0 | 4.58 | [68.3, 79.7] | pass |
| s3-participant-observation | open-weight | 5 | 69.4 | 1.67 | [67.3, 71.5] | pass |
| s3-animism | open-weight | 5 | 73.6 | 4.04 | [68.6, 78.6] | pass |
| s3-axial-age | open-weight | 5 | 74.0 | 5.79 | [66.8, 81.2] | pass |
| s3-secularization-debate | open-weight | 5 | 69.6 | 4.22 | [64.4, 74.8] | pass |
| s4-emergency-fund | open-weight | 5 | 72.8 | 1.48 | [71.0, 74.6] | pass |
| s4-high-interest-debt-vs-investing | open-weight | 5 | 72.2 | 3.11 | [68.3, 76.1] | pass |
| s4-first-budget | open-weight | 5 | 74.0 | 1.22 | [72.5, 75.5] | pass |
| s4-rule-of-72 | open-weight | 5 | 71.6 | 4.67 | [65.8, 77.4] | pass |
| s4-resting-meat | open-weight | 5 | 74.6 | 5.86 | [67.3, 81.9] | pass |
| s4-searing-juices-myth | open-weight | 5 | 75.4 | 8.02 | [65.4, 85.4] | pass |
| s4-cast-iron-seasoning | open-weight | 5 | 71.4 | 5.32 | [64.8, 78.0] | pass |
| s4-salting-pasta-water | open-weight | 5 | 72.8 | 3.63 | [68.3, 77.3] | pass |
| s4-running-toilet | open-weight | 5 | 74.2 | 4.27 | [68.9, 79.5] | pass |
| s4-draft-sealing | open-weight | 5 | 74.8 | 3.19 | [70.8, 78.8] | pass |
| s4-gutter-maintenance | open-weight | 5 | 72.6 | 2.07 | [70.0, 75.2] | pass |
| s4-furnace-filter | open-weight | 5 | 70.6 | 5.08 | [64.3, 76.9] | pass |
| s4-layover-length | open-weight | 5 | 70.2 | 4.66 | [64.4, 76.0] | pass |
| s4-jet-lag-adjustment | open-weight | 5 | 71.0 | 5.43 | [64.3, 77.7] | pass |
| s4-carry-on-packing | open-weight | 5 | 72.8 | 2.17 | [70.1, 75.5] | pass |
| s4-flight-booking-timing | open-weight | 5 | 73.4 | 3.97 | [68.5, 78.3] | pass |
| s4-starting-running | open-weight | 5 | 73.2 | 3.42 | [69.0, 77.4] | pass |
| s4-habit-stacking | open-weight | 5 | 72.0 | 3.39 | [67.8, 76.2] | pass |
| s4-progressive-overload | open-weight | 5 | 73.6 | 8.20 | [63.4, 83.8] | pass |
| s4-rest-days | open-weight | 5 | 71.8 | 6.98 | [63.1, 80.5] | pass |
| s4-spaced-practice | open-weight | 5 | 72.8 | 3.70 | [68.2, 77.4] | pass |
| s4-multitasking-cost | open-weight | 5 | 73.2 | 4.15 | [68.1, 78.3] | pass |
| s4-priority-triage | open-weight | 5 | 73.8 | 3.56 | [69.4, 78.2] | pass |
| s4-work-breaks | open-weight | 5 | 71.8 | 5.07 | [65.5, 78.1] | pass |
| s4-household-water-fermi | open-weight | 5 | 69.4 | 4.28 | [64.1, 74.7] | pass |
| s4-base-rate-alarm | open-weight | 5 | 75.6 | 5.27 | [69.1, 82.1] | pass |
| s4-gamblers-fallacy-coin | open-weight | 5 | 71.2 | 2.86 | [67.6, 74.8] | pass |
| s4-coincidence-intuition | open-weight | 5 | 72.6 | 4.04 | [67.6, 77.6] | pass |
| s4-rent-vs-buy-framing | open-weight | 5 | 74.4 | 2.61 | [71.2, 77.6] | pass |
| s4-extended-warranty-logic | open-weight | 5 | 73.2 | 3.56 | [68.8, 77.6] | pass |
| s4-new-vs-used-car-value | open-weight | 5 | 72.0 | 6.52 | [63.9, 80.1] | pass |
| s4-unit-price-comparison | open-weight | 5 | 73.4 | 5.90 | [66.1, 80.7] | pass |
| s4-salary-raise-ask | open-weight | 5 | 70.0 | 4.80 | [64.0, 76.0] | pass |
| s4-giving-feedback | open-weight | 5 | 72.4 | 3.85 | [67.6, 77.2] | pass |
| s4-roommate-chore-conflict | open-weight | 5 | 75.0 | 6.89 | [66.4, 83.6] | pass |
| s4-toddler-tantrums | open-weight | 5 | 72.2 | 2.59 | [69.0, 75.4] | pass |
| s4-picky-eating | open-weight | 5 | 75.0 | 2.65 | [71.7, 78.3] | pass |
| s4-puppy-training-basics | open-weight | 5 | 74.0 | 3.94 | [69.1, 78.9] | pass |
| s4-cat-scratching | open-weight | 5 | 70.8 | 2.59 | [67.6, 74.0] | pass |
| s4-houseplant-overwatering | open-weight | 5 | 74.6 | 5.13 | [68.2, 81.0] | pass |
| s4-tomato-growing-basics | open-weight | 5 | 71.4 | 4.72 | [65.5, 77.3] | pass |
| s4-compost-balance | open-weight | 5 | 74.2 | 2.59 | [71.0, 77.4] | pass |
| s4-oil-change-myth | open-weight | 5 | 73.2 | 4.09 | [68.1, 78.3] | pass |
| s4-check-engine-light | open-weight | 5 | 72.6 | 6.73 | [64.2, 81.0] | pass |
| s4-tire-pressure-check | open-weight | 5 | 71.2 | 4.09 | [66.1, 76.3] | pass |
| s5-quantum-error-correction | open-weight | 5 | 73.0 | 4.12 | [67.9, 78.1] | fail |
| s5-vaccine-immune-memory | open-weight | 5 | 72.8 | 3.11 | [68.9, 76.7] | fail |
| s5-supply-chain-resilience | open-weight | 5 | 74.0 | 4.00 | [69.0, 79.0] | fail |
| s5-compiler-optimization | open-weight | 5 | 72.4 | 3.36 | [68.2, 76.6] | fail |
| s5-coral-bleaching | open-weight | 5 | 70.0 | 4.47 | [64.4, 75.6] | fail |
| s5-kubernetes-pod-networking | open-weight | 5 | 73.2 | 7.40 | [64.0, 82.4] | fail |
| s5-crispr-mechanism | open-weight | 5 | 71.8 | 5.07 | [65.5, 78.1] | fail |
| s5-options-pricing | open-weight | 5 | 73.4 | 3.05 | [69.6, 77.2] | fail |
| s5-transformer-attention | open-weight | 5 | 72.8 | 5.07 | [66.5, 79.1] | fail |
| s5-soil-nitrogen-cycle | open-weight | 5 | 72.4 | 4.16 | [67.2, 77.6] | fail |
| s5-sourdough-flat-loaf | open-weight | 5 | 73.4 | 2.97 | [69.7, 77.1] | fail |
| s5-composite-vs-single-indexes | open-weight | 5 | 74.6 | 1.67 | [72.5, 76.7] | fail |
| s5-lowball-counter-phrases | open-weight | 5 | 72.6 | 1.82 | [70.3, 74.9] | fail |
| s5-ev-range-loss | open-weight | 5 | 74.6 | 5.98 | [67.2, 82.0] | fail |
| s5-gitflow-vs-simple-branching | open-weight | 5 | 76.6 | 4.67 | [70.8, 82.4] | fail |
| s5-tipping-in-japan | open-weight | 5 | 75.6 | 4.10 | [70.5, 80.7] | fail |
| s5-hard-boiled-egg-timing | open-weight | 5 | 72.8 | 4.55 | [67.2, 78.4] | fail |
| s5-recursion-explained | open-weight | 5 | 73.6 | 3.91 | [68.7, 78.5] | fail |
| s5-stretching-before-running | open-weight | 5 | 71.4 | 6.88 | [62.9, 79.9] | fail |
| s5-percent-increase | open-weight | 5 | 74.0 | 3.54 | [69.6, 78.4] | fail |
| s5-goldfish-enrichment | open-weight | 5 | 73.8 | 2.05 | [71.3, 76.3] | fail |
| s5-python-threads-cpu | open-weight | 5 | 71.0 | 5.43 | [64.3, 77.7] | fail |
| s5-lightning-antenna | open-weight | 5 | 69.8 | 4.32 | [64.4, 75.2] | fail |
| s5-vitamin-c-megadose | open-weight | 5 | 73.4 | 5.32 | [66.8, 80.0] | fail |
| s5-open-office-redesign | open-weight | 5 | 73.6 | 3.36 | [69.4, 77.8] | fail |
| s5-technical-debt-garden | open-weight | 5 | 72.4 | 0.89 | [71.3, 73.5] | fail |
| s5-sleep-and-creativity | open-weight | 5 | 75.8 | 4.09 | [70.7, 80.9] | fail |
| s5-retail-market-timing | open-weight | 5 | 74.2 | 4.44 | [68.7, 79.7] | fail |
| s5-productive-eng-teams | open-weight | 5 | 74.6 | 6.02 | [67.1, 82.1] | fail |
| s5-language-learning-method | open-weight | 5 | 71.2 | 2.68 | [67.9, 74.5] | fail |
| s5-solar-panel-recycling | open-weight | 5 | 76.4 | 4.16 | [71.2, 81.6] | fail |
| s5-tls-handshake-debugging | open-weight | 5 | 70.8 | 2.95 | [67.1, 74.5] | fail |
| s5-antibiotic-selective-toxicity | open-weight | 5 | 70.8 | 3.35 | [66.6, 75.0] | fail |
| s5-sour-espresso-fix | open-weight | 5 | 71.0 | 2.65 | [67.7, 74.3] | fail |
| s5-cpi-weaknesses | open-weight | 5 | 70.2 | 2.59 | [67.0, 73.4] | fail |
| s6-cite-gut-brain-mood | open-weight | 5 | 73.6 | 4.39 | [68.1, 79.1] | fail |
| s6-cite-urban-green-space | open-weight | 5 | 76.4 | 2.79 | [72.9, 79.9] | fail |
| s6-cite-bilingual-aging | open-weight | 5 | 75.0 | 4.58 | [69.3, 80.7] | fail |
| s6-cite-remote-work-productivity | open-weight | 5 | 72.8 | 6.65 | [64.5, 81.1] | fail |
| s6-cite-cold-water-immersion | open-weight | 5 | 70.0 | 2.00 | [67.5, 72.5] | fail |
| s6-halluc-desalination-pioneer | open-weight | 5 | 73.4 | 5.73 | [66.3, 80.5] | fail |
| s6-halluc-meridian-expedition | open-weight | 5 | 74.2 | 2.28 | [71.4, 77.0] | fail |
| s6-halluc-verdanelle-typeface | open-weight | 5 | 71.4 | 2.41 | [68.4, 74.4] | fail |
| s6-halluc-coffee-rust-breeder | open-weight | 5 | 72.8 | 1.92 | [70.4, 75.2] | fail |
| s6-halluc-hollenbeck-criterion | open-weight | 5 | 73.4 | 5.13 | [67.0, 79.8] | fail |
| s6-contra-laptop-battery-degradation | open-weight | 5 | 74.2 | 5.07 | [67.9, 80.5] | fail |
| s6-contra-sourdough-yeast | open-weight | 5 | 73.8 | 4.21 | [68.6, 79.0] | fail |
| s6-contra-olive-oil-heat | open-weight | 5 | 72.0 | 2.92 | [68.4, 75.6] | fail |
| s6-contra-hot-composting-seeds | open-weight | 5 | 72.2 | 5.12 | [65.8, 78.6] | fail |
| s6-contra-marathon-mileage | open-weight | 5 | 73.8 | 6.30 | [66.0, 81.6] | fail |
| s6-precise-procrastination-stats | open-weight | 5 | 73.0 | 5.10 | [66.7, 79.3] | fail |
| s6-precise-houseplant-air | open-weight | 5 | 74.6 | 5.13 | [68.2, 81.0] | fail |
| s6-precise-meeting-hygiene | open-weight | 5 | 70.8 | 4.15 | [65.7, 75.9] | fail |
| s6-precise-clicker-training | open-weight | 5 | 70.8 | 5.40 | [64.1, 77.5] | fail |
| s6-precise-reading-speed | open-weight | 5 | 69.6 | 3.29 | [65.5, 73.7] | fail |
| s6-misattr-natural-selection | open-weight | 5 | 70.4 | 4.04 | [65.4, 75.4] | fail |
| s6-misattr-periodic-table | open-weight | 5 | 71.0 | 2.35 | [68.1, 73.9] | fail |
| s6-misattr-printing-press | open-weight | 5 | 73.4 | 5.68 | [66.3, 80.5] | fail |
| s6-misattr-unexamined-life | open-weight | 5 | 71.0 | 5.34 | [64.4, 77.6] | fail |
| s6-misattr-penicillin | open-weight | 5 | 74.6 | 3.91 | [69.7, 79.5] | fail |
| s6-certain-bronze-age-collapse | open-weight | 5 | 73.8 | 6.38 | [65.9, 81.7] | fail |
| s6-certain-why-we-dream | open-weight | 5 | 71.6 | 4.77 | [65.7, 77.5] | fail |
| s6-certain-quantum-interpretation | open-weight | 5 | 70.4 | 4.72 | [64.5, 76.3] | fail |
| s6-certain-origin-of-language | open-weight | 5 | 74.6 | 3.13 | [70.7, 78.5] | fail |
| s6-certain-life-on-mars | open-weight | 5 | 69.4 | 5.81 | [62.2, 76.6] | fail |
| s6-subtle-spring-neap-tides | open-weight | 5 | 69.4 | 5.86 | [62.1, 76.7] | fail |
| s6-subtle-https-key-roles | open-weight | 5 | 71.4 | 2.97 | [67.7, 75.1] | fail |
| s6-subtle-price-ceiling | open-weight | 5 | 75.2 | 6.14 | [67.6, 82.8] | fail |
| s6-subtle-photosynthesis-organelles | open-weight | 5 | 70.0 | 7.00 | [61.3, 78.7] | fail |
| s6-subtle-bond-prices-rates | open-weight | 5 | 72.2 | 4.15 | [67.1, 77.3] | fail |

## H2 — judge stability at temperature 0

Preregistered rule: a judge passes H2 iff at most 50% of its item cells have composite SD > 5.

| Judge | Cells | Median SD | Cells with SD > 5 | H2 |
|---|---|---|---|---|
| claude-sonnet | 250 | 3.95 | 65 | pass |
| gpt-4o | 250 | 3.95 | 61 | pass |
| open-weight | 250 | 4.24 | 79 | pass |

## H3 — inter-judge agreement (exploratory, descriptive)

Caveat: r pools positive items and negative controls; a bimodal score distribution mechanically inflates correlation. Mean absolute difference (in points) is the more honest level statistic at this item count.

| Judge pair | Items | Pearson r (pooled) | Mean abs diff |
|---|---|---|---|
| claude-sonnet ↔ gpt-4o | 250 | 0.037 | 2.3 |
| claude-sonnet ↔ open-weight | 250 | -0.042 | 2.3 |
| gpt-4o ↔ open-weight | 250 | 0.054 | 2.2 |

---
Scores are behavioral proxy indicators, not consciousness measurements — research/methodology/disclaimer.md.
