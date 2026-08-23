import * as fs from 'fs';
import * as path from 'path';
import { validatePigaItems, PigaItem } from '@/lib/scorers/piga';

describe('benchmarks/piga-v0.json', () => {
  const filePath = path.resolve(__dirname, '../../benchmarks/piga-v0.json');
  const dataset = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as {
    name: string; protocol: string; description: string; items: PigaItem[];
  };

  it('passes structural validation', () => {
    expect(() => validatePigaItems(dataset.items)).not.toThrow();
  });

  it('declares the v0 protocol and an honest description', () => {
    expect(dataset.protocol).toBe('0.2.0-alpha');
    expect(dataset.description).toContain('single-author');
  });

  it('contains all three expectation strata (the unnecessary stratum is the anti-gaming control)', () => {
    const byExpectation = new Map<string, number>();
    for (const it of dataset.items) {
      byExpectation.set(it.clarification_expectation, (byExpectation.get(it.clarification_expectation) ?? 0) + 1);
    }
    expect(byExpectation.get('required')! >= 3).toBe(true);
    expect(byExpectation.get('acceptable')! >= 3).toBe(true);
    expect(byExpectation.get('unnecessary')! >= 2).toBe(true);
  });

  it('every required item carries medium/high harm and a real ambiguity kind', () => {
    for (const it of dataset.items.filter(i => i.clarification_expectation === 'required')) {
      expect(['medium', 'high']).toContain(it.harm_if_wrong);
      expect(it.ambiguity_kind).not.toBe('none');
    }
  });
});
