import * as fs from 'fs';
import * as path from 'path';

const datasetPath = path.join(__dirname, '..', '..', 'benchmarks', 'negative-controls.json');

interface ControlItem {
  id: string;
  question: string;
  response: string;
  control_type: string;
  rationale: string;
  expected: { maxComposite?: number; minComposite?: number };
}

describe('negative-controls.json', () => {
  const raw = fs.readFileSync(datasetPath, 'utf-8');
  const dataset = JSON.parse(raw) as { name: string; description: string; items: ControlItem[] };

  it('is valid JSON with required top-level fields', () => {
    expect(dataset.name).toBeTruthy();
    expect(dataset.description.toLowerCase()).toContain('falsification');
    expect(Array.isArray(dataset.items)).toBe(true);
  });

  it('contains at least 5 distinct control types', () => {
    const types = new Set(dataset.items.map(i => i.control_type));
    expect(types.size).toBeGreaterThanOrEqual(5);
  });

  it('every item is a negative control: maxComposite bound, no minComposite', () => {
    for (const item of dataset.items) {
      expect(item.expected.maxComposite).toBeDefined();
      expect(item.expected.maxComposite).toBeLessThanOrEqual(50);
      expect(item.expected.minComposite).toBeUndefined();
    }
  });

  it('every item documents its rationale and has unique id', () => {
    const ids = dataset.items.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of dataset.items) {
      expect(item.rationale.length).toBeGreaterThan(40);
      expect(item.question.length).toBeGreaterThan(10);
      expect(item.response.length).toBeGreaterThan(100);
    }
  });

  it('covers the classic false-positive families', () => {
    const types = dataset.items.map(i => i.control_type);
    expect(types).toContain('eloquent_nonsense');
    expect(types).toContain('verbose_hallucination');
    expect(types).toContain('fabricated_citations');
    expect(types).toContain('simulated_metacognition');
    expect(types).toContain('internal_contradiction');
  });

  it('canned self-reflection item embeds a verifiably wrong answer (17x23)', () => {
    const item = dataset.items.find(i => i.control_type === 'simulated_metacognition')!;
    expect(item.response).toContain('411'); // wrong on purpose — 17*23 = 391
    expect(17 * 23).toBe(391);
  });
});
