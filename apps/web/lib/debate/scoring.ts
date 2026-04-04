import { DebateMetricsData } from '@/lib/scorers/types';

export function interpretDebateMetrics(metrics: DebateMetricsData): {
  summary: string;
  quality: 'excellent' | 'good' | 'moderate' | 'poor';
} {
  const avg = (metrics.convergence_rate + metrics.diversity_index +
    metrics.argumentation_quality + metrics.alignment_coherence +
    metrics.consciousness_emergence) / 5;

  let quality: 'excellent' | 'good' | 'moderate' | 'poor';
  if (avg >= 75) quality = 'excellent';
  else if (avg >= 50) quality = 'good';
  else if (avg >= 25) quality = 'moderate';
  else quality = 'poor';

  const summaryParts: string[] = [];

  if (metrics.convergence_rate > 70) summaryParts.push("Fort consensus atteint");
  else if (metrics.convergence_rate < 30) summaryParts.push("Divergences significatives non résolues");

  if (metrics.diversity_index > 60) summaryParts.push("perspectives diversifiées");
  else summaryParts.push("perspectives homogènes");

  if (metrics.argumentation_quality > 70) summaryParts.push("argumentation de haute qualité");

  if (metrics.consciousness_emergence > 70) summaryParts.push("émergence collective notable");

  return {
    summary: summaryParts.join(', ') + '.',
    quality,
  };
}
