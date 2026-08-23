import { mean, sampleSd, tCritical95, summarize, pearson, meanAbsDiff } from '../descriptive';

describe('mean', () => {
  it('computes the arithmetic mean', () => {
    expect(mean([2, 4, 6])).toBe(4);
  });
  it('throws on empty input', () => {
    expect(() => mean([])).toThrow();
  });
});

describe('sampleSd', () => {
  it('uses the n-1 denominator (Bessel correction)', () => {
    // [2, 4]: sample SD = sqrt(((2-3)^2+(4-3)^2)/1) = sqrt(2)
    expect(sampleSd([2, 4])).toBeCloseTo(Math.SQRT2, 10);
  });
  it('returns null for n < 2 instead of a misleading 0', () => {
    expect(sampleSd([42])).toBeNull();
  });
  it('is 0 for identical values', () => {
    expect(sampleSd([7, 7, 7])).toBe(0);
  });
});

describe('tCritical95', () => {
  it('df=4 (n=5) is 2.776, not the normal 1.96', () => {
    expect(tCritical95(4)).toBe(2.776);
  });
  it('falls back to 1.96 beyond df=30', () => {
    expect(tCritical95(200)).toBe(1.96);
  });
  it('rejects df < 1', () => {
    expect(() => tCritical95(0)).toThrow();
  });
});

describe('summarize', () => {
  it('produces a t-based CI for n=5', () => {
    const s = summarize([60, 62, 64, 66, 68]);
    expect(s.n).toBe(5);
    expect(s.mean).toBe(64);
    // SD = sqrt(40/4) = 3.1623; half-width = 2.776 * 3.1623/sqrt(5) = 3.9258
    expect(s.sd).toBeCloseTo(3.1623, 3);
    expect(s.ci95![0]).toBeCloseTo(64 - 3.9258, 2);
    expect(s.ci95![1]).toBeCloseTo(64 + 3.9258, 2);
  });
  it('single sample: mean present, sd and ci null', () => {
    const s = summarize([50]);
    expect(s.mean).toBe(50);
    expect(s.sd).toBeNull();
    expect(s.ci95).toBeNull();
  });
});

describe('pearson', () => {
  it('perfect positive correlation', () => {
    expect(pearson([1, 2, 3], [10, 20, 30])).toBeCloseTo(1, 10);
  });
  it('perfect negative correlation', () => {
    expect(pearson([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1, 10);
  });
  it('null when a variable has zero variance', () => {
    expect(pearson([1, 2, 3], [5, 5, 5])).toBeNull();
  });
  it('null for n < 3', () => {
    expect(pearson([1, 2], [3, 4])).toBeNull();
  });
});

describe('meanAbsDiff', () => {
  it('mean of absolute pairwise differences', () => {
    expect(meanAbsDiff([70, 80], [75, 70])).toBe(7.5);
  });
});
