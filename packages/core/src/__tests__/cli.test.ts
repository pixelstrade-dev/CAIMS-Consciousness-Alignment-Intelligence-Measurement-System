import { parseArgs } from '../cli';

describe('caims CLI parseArgs', () => {
  it('defaults: table format, concurrency 1', () => {
    const a = parseArgs([]);
    expect(a).toMatchObject({ format: 'table', concurrency: 1, help: false, version: false });
    expect(a.error).toBeUndefined();
  });

  it('parses single-interaction flags', () => {
    const a = parseArgs(['-q', 'Why?', '-r', 'Because.', '--format', 'json', '-o', 'out.json']);
    expect(a).toMatchObject({ question: 'Why?', response: 'Because.', format: 'json', output: 'out.json' });
  });

  it('parses dataset flags with model override and concurrency clamp', () => {
    const a = parseArgs(['-f', 'items.json', '-m', 'judge-x', '-c', '99']);
    expect(a).toMatchObject({ file: 'items.json', model: 'judge-x', concurrency: 10 });
    expect(parseArgs(['-c', '0']).concurrency).toBe(1);
    expect(parseArgs(['-c', 'nope']).concurrency).toBe(1);
  });

  it('rejects unknown flags via error field (no process.exit in the parser)', () => {
    expect(parseArgs(['--bogus']).error).toContain('Unknown argument');
  });

  it('rejects invalid --format values', () => {
    expect(parseArgs(['--format', 'yaml']).error).toContain('--format');
  });

  it('help and version flags', () => {
    expect(parseArgs(['--help']).help).toBe(true);
    expect(parseArgs(['-V']).version).toBe(true);
  });
});
