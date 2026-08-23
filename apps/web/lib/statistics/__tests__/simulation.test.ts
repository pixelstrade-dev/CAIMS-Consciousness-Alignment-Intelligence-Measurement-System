import { mulberry32, makeNormalSampler, boundDetectionPower, bootstrapHalfWidth } from '../simulation';
import { krippendorffAlphaInterval } from '../agreement';

describe('mulberry32 / normal sampler', () => {
  it('is deterministic for a fixed seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it('different seeds diverge', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it('normal sampler has ~0 mean and ~1 SD over many draws', () => {
    const normal = makeNormalSampler(mulberry32(7));
    const xs = Array.from({ length: 50_000 }, () => normal());
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const sd = Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / (xs.length - 1));
    expect(mean).toBeCloseTo(0, 1);
    expect(sd).toBeCloseTo(1, 1);
  });
});

describe('boundDetectionPower', () => {
  it('matches the analytic normal answer: sigma 5, delta 5, n 5 → P(mean>0) = Φ(√5) ≈ 0.987', () => {
    const p = boundDetectionPower({ sigma: 5, delta: 5, n: 5, sims: 40_000, seed: 1 });
    expect(p).toBeCloseTo(0.987, 2);
  });

  it('delta 0 → power ≈ 0.5 (mean sits exactly on the bound)', () => {
    const p = boundDetectionPower({ sigma: 5, delta: 0, n: 5, sims: 40_000, seed: 2 });
    expect(p).toBeCloseTo(0.5, 1);
  });

  it('power increases with n and with delta, decreases with sigma', () => {
    const base = { sigma: 5, delta: 2, sims: 20_000, seed: 3 };
    const p1 = boundDetectionPower({ ...base, n: 2 });
    const p2 = boundDetectionPower({ ...base, n: 10 });
    expect(p2).toBeGreaterThan(p1);
    const bigSigma = boundDetectionPower({ ...base, n: 5, sigma: 10 });
    const smallSigma = boundDetectionPower({ ...base, n: 5, sigma: 2 });
    expect(smallSigma).toBeGreaterThan(bigSigma);
  });

  it('negative delta (truly passing cell) gives the false-alarm rate, small for |delta| >> sigma/√n', () => {
    const p = boundDetectionPower({ sigma: 2, delta: -5, n: 5, sims: 20_000, seed: 4 });
    expect(p).toBeLessThan(0.001);
  });
});

describe('bootstrapHalfWidth', () => {
  it('is deterministic for a fixed seed and shrinks with item count', () => {
    const observed = [1, 3, 5, 7, 9, 11, 13, 2, 4, 6];
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const at10 = bootstrapHalfWidth({ observed, itemCount: 10, stat: mean, sims: 4000, seed: 5 })!;
    const at10b = bootstrapHalfWidth({ observed, itemCount: 10, stat: mean, sims: 4000, seed: 5 })!;
    const at100 = bootstrapHalfWidth({ observed, itemCount: 100, stat: mean, sims: 4000, seed: 5 })!;
    expect(at10.halfWidth).toBe(at10b.halfWidth);
    expect(at100.halfWidth).toBeLessThan(at10.halfWidth);
  });

  it('returns null when the statistic is mostly undefined at that size', () => {
    // alpha over 1-item resamples is always undefined (single pairable unit)
    const observed: number[][] = [[60, 65], [30, 40], [80, 82]];
    const res = bootstrapHalfWidth({
      observed, itemCount: 1,
      stat: (s) => krippendorffAlphaInterval(s), sims: 500, seed: 6,
    });
    expect(res).toBeNull();
  });

  it('reports the defined fraction honestly', () => {
    const observed: number[][] = [[60, 65], [30, 40], [80, 82], [50, 50]];
    const res = bootstrapHalfWidth({
      observed, itemCount: 4,
      stat: (s) => krippendorffAlphaInterval(s), sims: 2000, seed: 7,
    })!;
    expect(res.defined).toBeGreaterThan(0.5);
    expect(res.defined).toBeLessThanOrEqual(1);
  });
});
