// GENERATED from apps/web/lib — do not edit here. Run: node scripts/sync-core.mjs
// Evidence Card (v3, Phase A3 of the validity program) — the profile-first
// answer to the single-composite problem.
//
// Motivation (external audit + Run 001 evidence): a single "score" invites
// exactly the reading the disclaimer prohibits, and aggregation hides
// dimension-level signals in BOTH directions — on the fabricated-citations
// control the composite passed the text under GPT-4o even though the EQ
// dimension flagged it (both judges' lowest), and on the mechanical-response
// item CQ 4.0 was masked into composite 65.6. The Evidence Card makes the
// PROFILE primary, attaches a computed (never declared) evidence level, and
// states on every result that phenomenal consciousness was not assessed.
//
// The card changes what is REPORTED, not what is established: construct
// validity remains not established (see research/constructs/).

import { KPIScores, KPIWeights } from './types';
import { SCORING_PROTOCOL_VERSION } from './scoring-engine';
import { getActiveWeights } from './composite';
import { EnsembleScores } from './ensemble';
import { mean, sampleSd } from '../statistics/descriptive';

const KPI_KEYS = ['cq', 'aq', 'cfi', 'eq', 'sq'] as const;
type KpiKey = (typeof KPI_KEYS)[number];

const round1 = (x: number) => Math.round(x * 10) / 10;

/** What the sd/n of a profile entry are computed over — never mix them up. */
export type SpreadBasis = 'single-call' | 'samples-within-judge' | 'across-judges';

export interface ProfileEntry {
  score: number;
  /** Bessel-corrected sample SD over `basis`; null when undefined (n < 2). */
  sd: number | null;
  n: number;
  basis: SpreadBasis;
}

export type EvidenceLevel = 'L1' | 'L2' | 'L3';

export const EVIDENCE_LEVEL_LABELS: Record<EvidenceLevel, string> = {
  L1: 'single-judge behavioral',
  L2: 'multi-judge behavioral',
  L3: 'behavioral + deterministic verification',
};

// Standing caveats, sourced from committed Run 001 artifacts — attached to
// every card so no consumer can read a profile without them.
export const STANDING_CAVEATS = [
  'Scores are consciousness-related behavioral proxy indicators of text; construct validity is not established (research/constructs/)',
  'The composite can pass fabricated citations even when the epistemic dimension flags them (Run 001) — never read the aggregate without the profile',
  'Absolute values are judge-relative (Run 001: 12.7-point inter-judge mean absolute difference on identical items)',
] as const;

export interface EvidenceCard {
  /** The PRIMARY result: a per-dimension profile, not one number. */
  profile: Record<KpiKey, ProfileEntry>;
  /** Demoted convenience aggregate — never to be presented alone. */
  aggregate: {
    composite: number;
    weights: KPIWeights;
    note: string;
  };
  /** COMPUTED from what actually ran — never declared by the caller. */
  evidenceLevel: EvidenceLevel;
  evidenceLevelLabel: string;
  /** Constant by construction: no CAIMS output assesses phenomenal consciousness. */
  phenomenalConsciousness: 'NOT_ASSESSED';
  constructRegistry: string;
  caveats: string[];
}

const AGGREGATE_NOTE =
  'weighted convenience aggregate; weights are unvalidated hypotheses — read the profile, not this number';

function registryRef(): string {
  return `research/constructs/ (protocol ${SCORING_PROTOCOL_VERSION})`;
}

/** Summary of a deterministic-verification run, for level/caveat logic. */
export interface DeterministicChecksSummary {
  /** True only when the run actually established facts (see verificationEffective). */
  effective: boolean;
  notFound: number;
  truncated: boolean;
}

function verificationCaveats(det: DeterministicChecksSummary | undefined): string[] {
  if (!det) return [];
  const out: string[] = [];
  if (det.notFound > 0) {
    out.push(
      `deterministic citation verification found ${det.notFound} NON-EXISTENT reference(s) — see verification.citations before trusting this profile`
    );
  }
  if (det.truncated) {
    out.push('citation verification was truncated (cap hit): the unchecked tail may contain fabricated references');
  }
  if (!det.effective) {
    out.push('deterministic checks ran but established nothing (network errors or truncation) — the evidence level was NOT lifted');
  }
  return out;
}

/**
 * Card for the single-judge, single-sample path.
 * Evidence level is L1 by construction: one judge, one call.
 */
export function buildEvidenceCardFromSingle(
  scores: KPIScores,
  opts: { deterministicChecks?: DeterministicChecksSummary } = {}
): EvidenceCard {
  const profile = Object.fromEntries(
    KPI_KEYS.map(k => [k, {
      score: scores[`${k}Score` as const],
      sd: null,
      n: 1,
      basis: 'single-call' as const,
    }])
  ) as EvidenceCard['profile'];

  return {
    profile,
    aggregate: {
      composite: scores.composite,
      weights: scores.metadata.weightsUsed ?? getActiveWeights(),
      note: AGGREGATE_NOTE,
    },
    evidenceLevel: 'L1',
    evidenceLevelLabel: EVIDENCE_LEVEL_LABELS.L1,
    phenomenalConsciousness: 'NOT_ASSESSED',
    constructRegistry: registryRef(),
    caveats: [...STANDING_CAVEATS, ...verificationCaveats(opts.deterministicChecks)],
  };
}

/**
 * Card for the ensemble / n-sample path.
 *
 * Spread semantics (labeled per entry, never mixed):
 * - 1 ok judge, n samples → sd over that judge's samples ('samples-within-judge')
 * - ≥2 ok judges → sd across the judges' per-KPI means ('across-judges')
 *
 * Level is computed: L2 requires ≥2 DISTINCT PROVIDER FAMILIES among the ok
 * judges (two models of one family do not make an ensemble of families);
 * the L2→L3 lift requires a deterministic-verification run that was
 * EFFECTIVE (established facts: not truncated, not all-network-error) —
 * a run that verified nothing must not upgrade the label.
 */
export function buildEvidenceCardFromEnsemble(
  result: EnsembleScores,
  opts: { deterministicChecks?: DeterministicChecksSummary } = {}
): EvidenceCard {
  const judges = result.judges;
  // The API route 503s before reaching here with zero ok judges; guard for
  // library consumers hand-building an EnsembleScores.
  if (judges.length === 0) {
    throw new Error('buildEvidenceCardFromEnsemble requires at least one successful judge (scoreEnsemble returns null in that case)');
  }
  const multiJudge = judges.length >= 2;

  const profile = Object.fromEntries(
    KPI_KEYS.map(k => {
      if (!multiJudge) {
        const j = judges[0];
        return [k, {
          score: result.scores[k],
          sd: j.kpiSd[k],
          n: j.samplesOk,
          basis: 'samples-within-judge' as const,
        }];
      }
      const judgeMeans = judges.map(j => j.kpiMeans[k]);
      const sd = sampleSd(judgeMeans);
      return [k, {
        score: round1(mean(judgeMeans)),
        sd: sd === null ? null : round1(sd),
        n: judges.length,
        basis: 'across-judges' as const,
      }];
    })
  ) as EvidenceCard['profile'];

  const distinctProviders = new Set(judges.map(j => j.provider)).size;
  let level: EvidenceLevel = distinctProviders >= 2 ? 'L2' : 'L1';
  if (level === 'L2' && opts.deterministicChecks?.effective) level = 'L3';

  const caveats: string[] = [...STANDING_CAVEATS, ...verificationCaveats(opts.deterministicChecks)];
  if (result.failedJudges.length > 0) {
    caveats.push(
      `${result.failedJudges.length} configured judge(s) failed entirely and are excluded — see ensemble.failedJudges before trusting the profile`
    );
  }
  if (multiJudge && distinctProviders < 2) {
    caveats.push(
      'all successful judges share one provider family — treated as single-family evidence (L1), not a multi-judge ensemble'
    );
  }

  return {
    profile,
    aggregate: {
      composite: result.scores.composite,
      weights: result.metadata.weightsUsed,
      note: AGGREGATE_NOTE,
    },
    evidenceLevel: level,
    evidenceLevelLabel: EVIDENCE_LEVEL_LABELS[level],
    phenomenalConsciousness: 'NOT_ASSESSED',
    constructRegistry: registryRef(),
    caveats,
  };
}
