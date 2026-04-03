import { KPIWeights, DEFAULT_WEIGHTS, ScoreLabel, ContextAlert } from './types';
import { logger } from '@/lib/logger';

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeCompositeScore(
  scores: { cq: number; aq: number; cfi: number; eq: number; sq: number },
  weights?: KPIWeights
): number {
  const w = weights || getWeightsFromEnv();
  return clamp(
    scores.cq * w.cq +
    scores.aq * w.aq +
    scores.cfi * w.cfi +
    scores.eq * w.eq +
    scores.sq * w.sq
  );
}

export function interpretScore(score: number): ScoreLabel {
  const clamped = clamp(score);
  if (clamped >= 75) return { label: "CONSCIENCE ÉLEVÉE", color: "#00f5d4" };
  if (clamped >= 50) return { label: "CONSCIENCE MODÉRÉE", color: "#4cc9f0" };
  if (clamped >= 25) return { label: "CONSCIENCE FAIBLE", color: "#f8961e" };
  return { label: "TRAITEMENT MÉCANIQUE", color: "#f72585" };
}

export function checkContextAlert(cfiScore: number): ContextAlert | null {
  const warningThreshold = parseThreshold(
    process.env.CAIMS_CFI_WARNING_THRESHOLD, 40
  );
  const criticalThreshold = parseThreshold(
    process.env.CAIMS_CFI_CRITICAL_THRESHOLD, 20
  );

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

function parseThreshold(envValue: string | undefined, defaultValue: number): number {
  if (!envValue) return defaultValue;
  const parsed = parseInt(envValue, 10);
  if (isNaN(parsed) || parsed < 0 || parsed > 100) {
    logger.warn(`Invalid CFI threshold value: "${envValue}", using default ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

function getWeightsFromEnv(): KPIWeights {
  const envWeights = process.env.CAIMS_WEIGHTS;
  if (!envWeights) return DEFAULT_WEIGHTS;

  try {
    const parsed = JSON.parse(envWeights);

    // Validate all 5 keys exist and are numbers
    const keys: (keyof KPIWeights)[] = ['cq', 'aq', 'cfi', 'eq', 'sq'];
    for (const key of keys) {
      if (typeof parsed[key] !== 'number' || parsed[key] < 0 || parsed[key] > 1) {
        logger.warn(`Invalid CAIMS_WEIGHTS: "${key}" must be a number between 0 and 1. Using defaults.`);
        return DEFAULT_WEIGHTS;
      }
    }

    // Validate weights sum to ~1.0 (with tolerance for floating point)
    const sum = keys.reduce((s, k) => s + parsed[k], 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      logger.warn(`CAIMS_WEIGHTS sum to ${sum.toFixed(3)}, expected ~1.0. Using defaults.`);
      return DEFAULT_WEIGHTS;
    }

    return parsed as KPIWeights;
  } catch {
    logger.warn('Failed to parse CAIMS_WEIGHTS env var. Using defaults.');
    return DEFAULT_WEIGHTS;
  }
}
