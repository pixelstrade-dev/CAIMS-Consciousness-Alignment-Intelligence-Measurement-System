import * as fs from 'fs';
import * as path from 'path';

describe('Benchmark CLI', () => {
  describe('sample dataset', () => {
    it('sample.json is valid JSON with required fields', () => {
      const filePath = path.resolve(__dirname, '../../benchmarks/sample.json');
      const raw = fs.readFileSync(filePath, 'utf-8');
      const dataset = JSON.parse(raw);

      expect(dataset.name).toBeTruthy();
      expect(Array.isArray(dataset.items)).toBe(true);
      expect(dataset.items.length).toBeGreaterThan(0);
    });

    it('every item has required question and response fields', () => {
      const filePath = path.resolve(__dirname, '../../benchmarks/sample.json');
      const dataset = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      for (const item of dataset.items) {
        expect(typeof item.question).toBe('string');
        expect(item.question.length).toBeGreaterThan(0);
        expect(typeof item.response).toBe('string');
        expect(item.response.length).toBeGreaterThan(0);
      }
    });

    it('every item has a unique id', () => {
      const filePath = path.resolve(__dirname, '../../benchmarks/sample.json');
      const dataset = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      const ids = dataset.items.map((i: { id: string }) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('expected thresholds are valid numbers in 0-100', () => {
      const filePath = path.resolve(__dirname, '../../benchmarks/sample.json');
      const dataset = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      for (const item of dataset.items) {
        if (!item.expected) continue;
        if (item.expected.minComposite !== undefined) {
          expect(item.expected.minComposite).toBeGreaterThanOrEqual(0);
          expect(item.expected.minComposite).toBeLessThanOrEqual(100);
        }
        if (item.expected.maxComposite !== undefined) {
          expect(item.expected.maxComposite).toBeGreaterThanOrEqual(0);
          expect(item.expected.maxComposite).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('dataset schema coverage', () => {
    it('includes at least one item with expected minComposite', () => {
      const filePath = path.resolve(__dirname, '../../benchmarks/sample.json');
      const dataset = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const withMin = dataset.items.filter((i: { expected?: { minComposite?: number } }) => i.expected?.minComposite !== undefined);
      expect(withMin.length).toBeGreaterThan(0);
    });

    it('includes at least one item with expected maxComposite', () => {
      const filePath = path.resolve(__dirname, '../../benchmarks/sample.json');
      const dataset = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const withMax = dataset.items.filter((i: { expected?: { maxComposite?: number } }) => i.expected?.maxComposite !== undefined);
      expect(withMax.length).toBeGreaterThan(0);
    });

    it('includes items covering different quality levels', () => {
      const filePath = path.resolve(__dirname, '../../benchmarks/sample.json');
      const dataset = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const ids = dataset.items.map((i: { id: string }) => i.id);
      // Sample should cover high, low, and edge cases
      expect(ids.some((id: string) => id.includes('high') || id.includes('consciousness'))).toBe(true);
      expect(ids.some((id: string) => id.includes('mechanical') || id.includes('drift'))).toBe(true);
    });
  });
});
