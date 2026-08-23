import { krippendorffAlphaInterval, icc2_1, interRaterAgreement } from '../agreement';

describe('krippendorffAlphaInterval', () => {
  it('perfect agreement → alpha = 1', () => {
    expect(krippendorffAlphaInterval([[3, 3], [7, 7], [50, 50]])).toBeCloseTo(1, 10);
  });

  it('hand-computed anchor: units (1,2) and (3,4) → alpha = 0.7', () => {
    // Do = (1/4)[((1-2)²+(2-1)²)/1 + ((3-4)²+(4-3)²)/1] = 1
    // De = Σ ordered pairs over {1,2,3,4} (x-x')² / (4·3) = 40/12
    // alpha = 1 - 1/(40/12) = 0.7
    expect(krippendorffAlphaInterval([[1, 2], [3, 4]])).toBeCloseTo(0.7, 10);
  });

  it('units with a single rating are ignored (Krippendorff: not pairable)', () => {
    const withSingleton = krippendorffAlphaInterval([[1, 2], [3, 4], [99]]);
    expect(withSingleton).toBeCloseTo(0.7, 10);
  });

  it('undefined cases return null, never a fake number', () => {
    expect(krippendorffAlphaInterval([])).toBeNull();
    expect(krippendorffAlphaInterval([[5]])).toBeNull();
    expect(krippendorffAlphaInterval([[4, 4], [4, 4]])).toBeNull(); // zero expected disagreement
  });

  it('a single pairable unit is undefined (alpha would be identically 0 — a misleading artifact)', () => {
    expect(krippendorffAlphaInterval([[1, 1.0001]])).toBeNull();
    expect(krippendorffAlphaInterval([[1, 5], [99]])).toBeNull(); // singleton does not rescue it
  });

  it('systematic offset between raters is penalized (absolute agreement, unlike Pearson r)', () => {
    // Rater B = Rater A + 20: r would be 1.0; alpha must be well below 1.
    const alpha = krippendorffAlphaInterval([[10, 30], [40, 60], [70, 90]]);
    expect(alpha).not.toBeNull();
    expect(alpha!).toBeLessThan(0.8);
  });
});

describe('icc2_1', () => {
  it('PUBLISHED ANCHOR: Shrout & Fleiss (1979) dataset → ICC(2,1) ≈ 0.29', () => {
    // 6 subjects × 4 judges, the classic worked example from the paper
    // that defined the convention.
    const sf = [
      [9, 2, 5, 8],
      [6, 1, 3, 2],
      [8, 4, 6, 8],
      [7, 1, 2, 6],
      [10, 5, 6, 9],
      [6, 2, 4, 7],
    ];
    const r = icc2_1(sf)!;
    expect(r.icc2_1).toBeCloseTo(0.29, 2);
    expect(r.subjects).toBe(6);
    expect(r.raters).toBe(4);
  });

  it('perfect agreement → ICC = 1', () => {
    const r = icc2_1([[1, 1], [5, 5], [9, 9]])!;
    expect(r.icc2_1).toBeCloseTo(1, 10);
  });

  it('systematic rater offset lowers ICC(2,1) (absolute agreement)', () => {
    const r = icc2_1([[10, 30], [40, 60], [70, 90]])!;
    expect(r.icc2_1).toBeLessThan(0.9);
  });

  it('undefined cases return null (ragged, too small)', () => {
    expect(icc2_1([])).toBeNull();
    expect(icc2_1([[1, 2]])).toBeNull();
    expect(icc2_1([[1], [2]])).toBeNull();
    expect(icc2_1([[1, 2], [3]])).toBeNull();
  });
});

describe('interRaterAgreement', () => {
  it('splits items honestly: alpha uses >=2 ratings, ICC only complete rows', () => {
    const items = [
      [60, 65, 70], // complete (3 raters)
      [50, 55, 52], // complete
      [80, 85],     // one judge missing → alpha yes, ICC no
      [40],         // singleton → neither
    ];
    const res = interRaterAgreement(items, 3);
    expect(res.alphaItems).toBe(3);
    expect(res.iccItems).toBe(2);
    expect(res.krippendorffAlpha).not.toBeNull();
    expect(res.icc).not.toBeNull();
    expect(res.icc!.raters).toBe(3);
    expect(res.note).toContain('DESCRIPTIVE');
  });
});
