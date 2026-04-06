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

  it('returns null at exactly the warning threshold (40)', () => {
    expect(checkContextAlert(40)).toBeNull();
  });

  it('returns warning at exactly one below warning threshold (39)', () => {
    const alert = checkContextAlert(39);
    expect(alert).not.toBeNull();
    expect(alert!.level).toBe('warning');
    expect(alert!.cfiScore).toBe(39);
    expect(alert!.message).toBeTruthy();
  });

  it('returns critical at exactly one below critical threshold (19)', () => {
    const alert = checkContextAlert(19);
    expect(alert).not.toBeNull();
    expect(alert!.level).toBe('critical');
  });

  describe('with custom thresholds from env', () => {
    const origWarning = process.env.CAIMS_CFI_WARNING_THRESHOLD;
    const origCritical = process.env.CAIMS_CFI_CRITICAL_THRESHOLD;

    afterEach(() => {
      if (origWarning === undefined) delete process.env.CAIMS_CFI_WARNING_THRESHOLD;
      else process.env.CAIMS_CFI_WARNING_THRESHOLD = origWarning;
      if (origCritical === undefined) delete process.env.CAIMS_CFI_CRITICAL_THRESHOLD;
      else process.env.CAIMS_CFI_CRITICAL_THRESHOLD = origCritical;
    });

    it('uses custom warning threshold from env', () => {
      process.env.CAIMS_CFI_WARNING_THRESHOLD = '60';
      expect(checkContextAlert(55)?.level).toBe('warning');
      expect(checkContextAlert(65)).toBeNull();
    });

    it('uses custom critical threshold from env', () => {
      process.env.CAIMS_CFI_CRITICAL_THRESHOLD = '30';
      expect(checkContextAlert(25)?.level).toBe('critical');
      expect(checkContextAlert(35)?.level).toBe('warning');
    });

    it('falls back to default on invalid threshold (negative)', () => {
      process.env.CAIMS_CFI_WARNING_THRESHOLD = '-5';
      // Invalid → falls back to default 40
      expect(checkContextAlert(35)?.level).toBe('warning');
    });

    it('falls back to default on invalid threshold (NaN)', () => {
      process.env.CAIMS_CFI_WARNING_THRESHOLD = 'abc';
      expect(checkContextAlert(35)?.level).toBe('warning');
    });

    it('falls back to default on threshold > 100', () => {
      process.env.CAIMS_CFI_CRITICAL_THRESHOLD = '150';
      // Invalid → falls back to default 20
      expect(checkContextAlert(15)?.level).toBe('critical');
      expect(checkContextAlert(25)?.level).toBe('warning');
    });
  });
});

describe('computeCompositeScore with env weights', () => {
  const origWeights = process.env.CAIMS_WEIGHTS;

  afterEach(() => {
    if (origWeights === undefined) delete process.env.CAIMS_WEIGHTS;
    else process.env.CAIMS_WEIGHTS = origWeights;
  });

  it('uses custom weights from CAIMS_WEIGHTS env var', () => {
    process.env.CAIMS_WEIGHTS = JSON.stringify({ cq: 0.5, aq: 0.2, cfi: 0.1, eq: 0.1, sq: 0.1 });
    const scores = { cq: 100, aq: 0, cfi: 0, eq: 0, sq: 0 };
    // Without explicit weights param, should read from env: 100*0.5 = 50
    expect(computeCompositeScore(scores)).toBe(50);
  });

  it('falls back to defaults on invalid JSON', () => {
    process.env.CAIMS_WEIGHTS = 'not-json';
    const scores = { cq: 80, aq: 70, cfi: 60, eq: 50, sq: 40 };
    expect(computeCompositeScore(scores)).toBe(67); // default weights
  });

  it('falls back to defaults when weight key is out of range', () => {
    process.env.CAIMS_WEIGHTS = JSON.stringify({ cq: 2.0, aq: 0.2, cfi: 0.1, eq: 0.1, sq: 0.1 });
    const scores = { cq: 80, aq: 70, cfi: 60, eq: 50, sq: 40 };
    expect(computeCompositeScore(scores)).toBe(67);
  });

  it('falls back to defaults when weights do not sum to 1.0', () => {
    process.env.CAIMS_WEIGHTS = JSON.stringify({ cq: 0.5, aq: 0.5, cfi: 0.5, eq: 0.5, sq: 0.5 });
    const scores = { cq: 80, aq: 70, cfi: 60, eq: 50, sq: 40 };
    expect(computeCompositeScore(scores)).toBe(67);
  });

  it('falls back to defaults when a weight key is missing', () => {
    process.env.CAIMS_WEIGHTS = JSON.stringify({ cq: 0.5, aq: 0.5 });
    const scores = { cq: 80, aq: 70, cfi: 60, eq: 50, sq: 40 };
    // Missing keys → typeof undefined !== 'number' → fallback
    expect(computeCompositeScore(scores)).toBe(67);
  });
});
