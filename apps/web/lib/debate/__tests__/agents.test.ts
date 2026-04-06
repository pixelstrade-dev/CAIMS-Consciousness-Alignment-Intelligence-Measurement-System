import { CAIMS_DEFAULT_AGENTS, getAgentById, getAgentsByIds } from '../agents';

describe('CAIMS_DEFAULT_AGENTS', () => {
  it('defines exactly 5 agents', () => {
    expect(CAIMS_DEFAULT_AGENTS).toHaveLength(5);
  });

  it('has unique IDs for all agents', () => {
    const ids = CAIMS_DEFAULT_AGENTS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has all required fields for every agent', () => {
    for (const agent of CAIMS_DEFAULT_AGENTS) {
      expect(agent.id).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.role).toBeTruthy();
      expect(agent.model).toBeTruthy();
      expect(agent.personality).toBeTruthy();
      expect(agent.systemPrompt).toBeTruthy();
      expect(agent.systemPrompt.length).toBeGreaterThan(50);
    }
  });

  it('contains expected agent IDs', () => {
    const ids = CAIMS_DEFAULT_AGENTS.map(a => a.id);
    expect(ids).toContain('agt-architect');
    expect(ids).toContain('agt-researcher');
    expect(ids).toContain('agt-builder');
    expect(ids).toContain('agt-critic');
    expect(ids).toContain('agt-orchestrator');
  });

  it('all agents have names in uppercase', () => {
    for (const agent of CAIMS_DEFAULT_AGENTS) {
      expect(agent.name).toBe(agent.name.toUpperCase());
    }
  });
});

describe('getAgentById', () => {
  it('returns the correct agent for a valid ID', () => {
    const agent = getAgentById('agt-architect');
    expect(agent).toBeDefined();
    expect(agent!.name).toBe('ARCHITECT');
  });

  it('returns undefined for an unknown ID', () => {
    expect(getAgentById('agt-nonexistent')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getAgentById('')).toBeUndefined();
  });
});

describe('getAgentsByIds', () => {
  it('returns multiple agents in order', () => {
    const agents = getAgentsByIds(['agt-critic', 'agt-builder']);
    expect(agents).toHaveLength(2);
    expect(agents[0].name).toBe('CRITIC');
    expect(agents[1].name).toBe('BUILDER');
  });

  it('returns all 5 agents when all IDs provided', () => {
    const allIds = CAIMS_DEFAULT_AGENTS.map(a => a.id);
    const agents = getAgentsByIds(allIds);
    expect(agents).toHaveLength(5);
  });

  it('throws for an unknown agent ID', () => {
    expect(() => getAgentsByIds(['agt-architect', 'agt-fake'])).toThrow(
      'Agent not found: agt-fake'
    );
  });

  it('throws for empty string ID in array', () => {
    expect(() => getAgentsByIds([''])).toThrow('Agent not found: ');
  });

  it('returns empty array for empty input', () => {
    expect(getAgentsByIds([])).toEqual([]);
  });
});
