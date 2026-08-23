import { supportsTemperature } from '../anthropic';

describe('supportsTemperature (Claude 5 family rejects the parameter)', () => {
  it('Claude 5 family models do not support temperature', () => {
    expect(supportsTemperature('claude-sonnet-5')).toBe(false);
    expect(supportsTemperature('claude-opus-5')).toBe(false);
    expect(supportsTemperature('claude-fable-5')).toBe(false);
  });

  it('Claude 4.x models still support temperature', () => {
    expect(supportsTemperature('claude-sonnet-4-20250514')).toBe(true);
    expect(supportsTemperature('claude-haiku-4-5-20251001')).toBe(true);
  });

  it('non-Claude models are unaffected (adapter never sees them, but be safe)', () => {
    expect(supportsTemperature('gpt-4o')).toBe(true);
  });

  it('claude-sonnet-50 would not false-positive as the 5 family', () => {
    expect(supportsTemperature('claude-sonnet-50')).toBe(true);
  });
});
