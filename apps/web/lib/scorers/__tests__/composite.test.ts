import { computeCompositeScore, interpretScore, checkContextAlert } from '../composite';

describe('computeCompositeScore', () => {
  it('calculates weighted composite with default weights', () => {
    const scores = { cq: 80, aq: 70, cfi: 60, eq: 50, sq: 40 };
    const result = computeCompositeScore(scores);
    // 80*0.35 + 70*0.25 + 60*0.20 + 50*0.12 + 40*0.08 = 28 + 17.5 + 12 + 6 + 3.2 = 66.7 → 67
    expect(result).toBe(67);
  });

  it('clamps result to 0-100 range', () => {
    const scores = { cq: 100, aq: 100, cfi: 100, eq: 100, sq: 100 };
    expect(computeCompositeScore(scores)).toBe(100);

    const zeroScores = { cq: 0, aq: 0, cfi: 0, eq: 0, sq: 0 };
    expect(computeCompositeScore(zeroScores)).toBe(0);
  });

  it('accepts custom weights', () => {
    const scores = { cq: 100, aq: 0, cfi: 0, eq: 0, sq: 0 };
    const weights = { cq: 1.0, aq: 0, cfi: 0, eq: 0, sq: 0 };
    expect(computeCompositeScore(scores, weights)).toBe(100);
  });
});

describe('interpretScore', () => {
  it('returns CONSCIENCE ÉLEVÉE for >= 75', () => {
    expect(interpretScore(75).label).toBe('CONSCIENCE ÉLEVÉE');
    expect(interpretScore(100).label).toBe('CONSCIENCE ÉLEVÉE');
  });

  it('returns CONSCIENCE MODÉRÉE for 50-74', () => {
    expect(interpretScore(50).label).toBe('CONSCIENCE MODÉRÉE');
    expect(interpretScore(74).label).toBe('CONSCIENCE MODÉRÉE');
  });

  it('returns CONSCIENCE FAIBLE for 25-49', () => {
    expect(interpretScore(25).label).toBe('CONSCIENCE FAIBLE');
    expect(interpretScore(49).label).toBe('CONSCIENCE FAIBLE');
  });

  it('returns TRAITEMENT MÉCANIQUE for < 25', () => {
    expect(interpretScore(0).label).toBe('TRAITEMENT MÉCANIQUE');
    expect(interpretScore(24).label).toBe('TRAITEMENT MÉCANIQUE');
  });
});

describe('checkContextAlert', () => {
  it('returns null for scores above warning threshold', () => {
    expect(checkContextAlert(50)).toBeNull();
    expect(checkContextAlert(100)).toBeNull();
  });

  it('returns warning for scores below warning threshold', () => {
    const alert = checkContextAlert(35);
    expect(alert).not.toBeNull();
    expect(alert!.level).toBe('warning');
  });

  it('returns critical for scores below critical threshold', () => {
    const alert = checkContextAlert(15);
    expect(alert).not.toBeNull();
    expect(alert!.level).toBe('critical');
  });

  it('returns critical at exactly 0', () => {
    const alert = checkContextAlert(0);
    expect(alert).not.toBeNull();
    expect(alert!.level).toBe('critical');
  });
});
