import { KPIWeights, DEFAULT_WEIGHTS, ScoreLabel, ContextAlert } from './types';

export function computeCompositeScore(
  scores: { cq: number; aq: number; cfi: number; eq: number; sq: number },
  weights?: KPIWeights
): number {
  const w = weights || getWeightsFromEnv();
  return Math.round(
    scores.cq * w.cq +
    scores.aq * w.aq +
    scores.cfi * w.cfi +
    scores.eq * w.eq +
    scores.sq * w.sq
  );
}

export function interpretScore(score: number): ScoreLabel {
  if (score >= 75) return { label: "CONSCIENCE ÉLEVÉE", color: "#00f5d4" };
  if (score >= 50) return { label: "CONSCIENCE MODÉRÉE", color: "#4cc9f0" };
  if (score >= 25) return { label: "CONSCIENCE FAIBLE", color: "#f8961e" };
  return { label: "TRAITEMENT MÉCANIQUE", color: "#f72585" };
}

export function checkContextAlert(cfiScore: number): ContextAlert | null {
  const warningThreshold = parseInt(process.env.CAIMS_CFI_WARNING_THRESHOLD || "40");
  const criticalThreshold = parseInt(process.env.CAIMS_CFI_CRITICAL_THRESHOLD || "20");

  if (cfiScore < criticalThreshold) {
    return {
      level: "critical",
      message: "Dérive contextuelle critique. Injection contexte initial recommandée.",
      cfiScore,
    };
  }
  if (cfiScore < warningThreshold) {
    return {
      level: "warning",
      message: "Dérive contextuelle détectée. Souhaitez-vous recentrer la conversation ?",
      cfiScore,
    };
  }
  return null;
}

function getWeightsFromEnv(): KPIWeights {
  // Allow override via CAIMS_WEIGHTS env var as JSON
  const envWeights = process.env.CAIMS_WEIGHTS;
  if (envWeights) {
    try {
      return JSON.parse(envWeights);
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_WEIGHTS;
}
