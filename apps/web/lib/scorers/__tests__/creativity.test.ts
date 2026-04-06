import { calculateCS, scoreCreativity } from '../creativity';
import { CSDetails } from '../types';

const mockJudge = jest.fn();

jest.mock('@/lib/adapters', () => ({
  getAdapter: () => ({
    judge: mockJudge,
  }),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('calculateCS', () => {
  it('calculates weighted CS with all equal scores', () => {
    const cs: CSDetails = {
      originality: 80,
      metaphor_use: 80,
      novel_connections: 80,
      divergent_thinking: 80,
      conceptual_fluency: 80,
    };
    // 80*(0.30+0.15+0.25+0.20+0.10) = 80*1.0 = 80
    expect(calculateCS(cs)).toBe(80);
  });

  it('applies correct weights to sub-scores', () => {
    const cs: CSDetails = {
      originality: 100,
      metaphor_use: 0,
      novel_connections: 0,
      divergent_thinking: 0,
      conceptual_fluency: 0,
    };
    // 100*0.30 = 30
    expect(calculateCS(cs)).toBe(30);
  });

  it('clamps result at 100', () => {
    const cs: CSDetails = {
      originality: 100,
      metaphor_use: 100,
      novel_connections: 100,
      divergent_thinking: 100,
      conceptual_fluency: 100,
    };
    expect(calculateCS(cs)).toBe(100);
  });

  it('clamps result at 0', () => {
    const cs: CSDetails = {
      originality: 0,
      metaphor_use: 0,
      novel_connections: 0,
      divergent_thinking: 0,
      conceptual_fluency: 0,
    };
    expect(calculateCS(cs)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    const cs: CSDetails = {
      originality: 70,   // 70 * 0.30 = 21
      metaphor_use: 70,  // 70 * 0.15 = 10.5
      novel_connections: 70, // 70 * 0.25 = 17.5
      divergent_thinking: 70, // 70 * 0.20 = 14
      conceptual_fluency: 70, // 70 * 0.10 = 7
    };
    // total = 21 + 10.5 + 17.5 + 14 + 7 = 70 → 70
    expect(calculateCS(cs)).toBe(70);
  });
});

describe('scoreCreativity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validCSResponse = JSON.stringify({
    cs: {
      originality: 75,
      metaphor_use: 60,
      novel_connections: 80,
      divergent_thinking: 70,
      conceptual_fluency: 65,
    },
    reasoning: 'The response demonstrates good originality and novel connections',
  });

  it('parses valid JSON response and returns csScore', async () => {
    mockJudge.mockResolvedValue(validCSResponse);

    const result = await scoreCreativity({
      response: 'test response',
      question: 'test question',
      history: [],
    });

    expect(result).not.toBeNull();
    expect(result!.csScore).toBeGreaterThanOrEqual(0);
    expect(result!.csScore).toBeLessThanOrEqual(100);
    expect(result!.details.originality).toBe(75);
    expect(result!.details.novel_connections).toBe(80);
    expect(result!.reasoning).toBe('The response demonstrates good originality and novel connections');
  });

  it('handles markdown-fenced JSON', async () => {
    mockJudge.mockResolvedValue('```json\n' + validCSResponse + '\n```');

    const result = await scoreCreativity({
      response: 'test', question: 'test', history: [],
    });
    expect(result).not.toBeNull();
  });

  it('handles JSON with surrounding text', async () => {
    mockJudge.mockResolvedValue('Here are the creativity scores:\n' + validCSResponse + '\nEnd.');

    const result = await scoreCreativity({
      response: 'test', question: 'test', history: [],
    });
    expect(result).not.toBeNull();
  });

  it('returns null for completely invalid response', async () => {
    mockJudge.mockResolvedValue('This is not JSON at all');

    const result = await scoreCreativity({
      response: 'test', question: 'test', history: [],
    });
    expect(result).toBeNull();
  });

  it('returns null when scores are out of range', async () => {
    const badResponse = JSON.stringify({
      cs: {
        originality: 150,
        metaphor_use: -10,
        novel_connections: 80,
        divergent_thinking: 70,
        conceptual_fluency: 65,
      },
      reasoning: 'Out of range',
    });
    mockJudge.mockResolvedValue(badResponse);

    const result = await scoreCreativity({
      response: 'test', question: 'test', history: [],
    });
    expect(result).toBeNull();
  });

  it('returns null when LLM adapter throws', async () => {
    mockJudge.mockRejectedValue(new Error('API timeout'));

    const result = await scoreCreativity({
      response: 'test', question: 'test', history: [],
    });
    expect(result).toBeNull();
  });

  it('uses default reasoning when omitted', async () => {
    const responseWithoutReasoning = JSON.stringify({
      cs: {
        originality: 50,
        metaphor_use: 50,
        novel_connections: 50,
        divergent_thinking: 50,
        conceptual_fluency: 50,
      },
    });
    mockJudge.mockResolvedValue(responseWithoutReasoning);

    const result = await scoreCreativity({
      response: 'test', question: 'test', history: [],
    });
    expect(result).not.toBeNull();
    expect(result!.reasoning).toBe('No reasoning provided');
  });
});
