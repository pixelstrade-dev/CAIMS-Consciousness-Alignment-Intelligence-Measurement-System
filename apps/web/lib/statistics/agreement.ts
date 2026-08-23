// Inter-rater agreement statistics (Phase A5 of the validity program).
//
// Run 001 reported pairwise Pearson r (bimodality-inflated, stated) and the
// mean absolute difference (12.7 points) between two judges. This module
// adds the two standard chance-corrected reliability coefficients the
// external audit called for — computed the same way the psychometric
// literature defines them, with the small-sample caveats stated rather
// than hidden:
//
// - Krippendorff's alpha (interval metric): chance-corrected agreement that
//   tolerates missing ratings (units with a single rating contribute
//   nothing). alpha = 1 - Do/De.
// - ICC(2,1): two-way random effects, absolute agreement, single rater
//   (Shrout & Fleiss convention) — requires a COMPLETE raters x subjects
//   matrix; incomplete rows must be dropped by the caller and reported.
//
// Honesty notes:
// - With 2 raters and ~11 items these are DESCRIPTIVE. Neither coefficient
//   at this size supports a reliability claim; the point is (a) honest
//   reporting now, (b) infrastructure ready for Run 002's >= 3 judge
//   families, where the numbers begin to mean something.
// - alpha and ICC(2,1) answer subtly different questions (agreement over
//   replaceability vs variance decomposition); report BOTH, never just the
//   more flattering one.

/**
 * Krippendorff's alpha for interval data.
 *
 * `units`: one entry per unit (item), each an array of the ratings that
 * unit received (variable length; units with < 2 ratings are ignored, as
 * Krippendorff specifies). Returns null when alpha is undefined (fewer
 * than 2 pairable units' worth of values, or zero expected disagreement —
 * all values identical).
 */
export function krippendorffAlphaInterval(units: number[][]): number | null {
  const pairable = units.filter(u => u.length >= 2);
  const values: number[] = [];
  for (const u of pairable) values.push(...u);
  const n = values.length;
  if (n < 2 || pairable.length === 0) return null;

  // Observed disagreement: within-unit ordered-pair squared differences,
  // each unit weighted by 1/(m_u - 1), averaged over all pairable values.
  let doSum = 0;
  for (const u of pairable) {
    const m = u.length;
    let unitSum = 0;
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        if (i !== j) unitSum += (u[i] - u[j]) ** 2;
      }
    }
    doSum += unitSum / (m - 1);
  }
  const observed = doSum / n;

  // Expected disagreement: ordered-pair squared differences across ALL
  // pairable values regardless of unit.
  let deSum = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) deSum += (values[i] - values[j]) ** 2;
    }
  }
  const expected = deSum / (n * (n - 1));

  if (expected === 0) return null; // all values identical: alpha undefined
  return 1 - observed / expected;
}

export interface IccResult {
  /** ICC(2,1): two-way random, absolute agreement, single rater. */
  icc2_1: number;
  /** ANOVA mean squares, exposed so results are auditable. */
  msr: number;
  msc: number;
  mse: number;
  subjects: number;
  raters: number;
}

/**
 * ICC(2,1) per Shrout & Fleiss (1979). `matrix` is subjects x raters and
 * must be COMPLETE (no missing cells) — callers drop incomplete subjects
 * and must report having done so. Returns null when undefined (< 2
 * subjects, < 2 raters, or a degenerate denominator).
 */
export function icc2_1(matrix: number[][]): IccResult | null {
  const n = matrix.length;
  if (n < 2) return null;
  const k = matrix[0].length;
  if (k < 2 || matrix.some(row => row.length !== k)) return null;

  const grand = matrix.flat().reduce((a, b) => a + b, 0) / (n * k);
  const subjectMeans = matrix.map(row => row.reduce((a, b) => a + b, 0) / k);
  const raterMeans = Array.from({ length: k }, (_, r) =>
    matrix.reduce((a, row) => a + row[r], 0) / n
  );

  const ssr = k * subjectMeans.reduce((a, m) => a + (m - grand) ** 2, 0);
  const ssc = n * raterMeans.reduce((a, m) => a + (m - grand) ** 2, 0);
  const sst = matrix.flat().reduce((a, x) => a + (x - grand) ** 2, 0);
  const sse = sst - ssr - ssc;

  const msr = ssr / (n - 1);
  const msc = ssc / (k - 1);
  const mse = sse / ((n - 1) * (k - 1));

  const denom = msr + (k - 1) * mse + (k * (msc - mse)) / n;
  if (denom === 0) return null;
  return { icc2_1: (msr - mse) / denom, msr, msc, mse, subjects: n, raters: k };
}

export interface InterRaterAgreement {
  krippendorffAlpha: number | null;
  icc: IccResult | null;
  /** Items used for alpha (>= 2 ratings) and for ICC (complete rows). */
  alphaItems: number;
  iccItems: number;
  note: string;
}

const AGREEMENT_NOTE =
  'Krippendorff alpha (interval) and ICC(2,1) (two-way random, absolute agreement, single rater). DESCRIPTIVE at small rater/item counts — neither supports a reliability claim below ~3 raters; report both, never only the more flattering one.';

/**
 * Convenience wrapper over a judge-by-item map of composite means.
 * `ratingsByItem`: for each item, the ratings available (one per judge that
 * scored it). ICC uses only items rated by ALL `expectedRaters` judges.
 */
export function interRaterAgreement(
  ratingsByItem: number[][],
  expectedRaters: number
): InterRaterAgreement {
  const alphaUnits = ratingsByItem.filter(u => u.length >= 2);
  const complete = ratingsByItem.filter(u => u.length === expectedRaters);
  return {
    krippendorffAlpha: krippendorffAlphaInterval(ratingsByItem),
    icc: expectedRaters >= 2 ? icc2_1(complete) : null,
    alphaItems: alphaUnits.length,
    iccItems: complete.length,
    note: AGREEMENT_NOTE,
  };
}
