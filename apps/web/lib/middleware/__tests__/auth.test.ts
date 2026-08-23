import { checkApiKey, _resetAuthWarningForTests } from '../auth';

jest.mock('@/lib/logger', () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const headersOf = (map: Record<string, string>) => ({
  get: (name: string) => map[name.toLowerCase()] ?? null,
});

describe('checkApiKey', () => {
  const OLD = process.env.CAIMS_API_KEYS;

  afterEach(() => {
    if (OLD === undefined) delete process.env.CAIMS_API_KEYS;
    else process.env.CAIMS_API_KEYS = OLD;
    _resetAuthWarningForTests();
  });

  it('open mode when CAIMS_API_KEYS is unset (local dev unbroken)', () => {
    delete process.env.CAIMS_API_KEYS;
    const res = checkApiKey(headersOf({}));
    expect(res).toEqual({ ok: true, mode: 'open' });
  });

  it('logs the open-mode warning exactly once', () => {
    delete process.env.CAIMS_API_KEYS;
    const { logger } = jest.requireMock('@/lib/logger');
    (logger.warn as jest.Mock).mockClear();
    checkApiKey(headersOf({}));
    checkApiKey(headersOf({}));
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('missing key is rejected when keys are configured', () => {
    process.env.CAIMS_API_KEYS = 'secret-a,secret-b';
    expect(checkApiKey(headersOf({}))).toEqual({ ok: false, reason: 'missing_key' });
  });

  it('accepts a valid key via Authorization: Bearer', () => {
    process.env.CAIMS_API_KEYS = 'secret-a,secret-b';
    const res = checkApiKey(headersOf({ authorization: 'Bearer secret-b' }));
    expect(res).toEqual({ ok: true, mode: 'keyed' });
  });

  it('accepts a valid key via x-api-key', () => {
    process.env.CAIMS_API_KEYS = 'secret-a';
    expect(checkApiKey(headersOf({ 'x-api-key': 'secret-a' }))).toEqual({ ok: true, mode: 'keyed' });
  });

  it('rejects an invalid key', () => {
    process.env.CAIMS_API_KEYS = 'secret-a';
    expect(checkApiKey(headersOf({ 'x-api-key': 'wrong' }))).toEqual({ ok: false, reason: 'invalid_key' });
  });

  it('rejects a key that is a prefix of a real key (length-safe comparison)', () => {
    process.env.CAIMS_API_KEYS = 'secret-abcdef';
    expect(checkApiKey(headersOf({ 'x-api-key': 'secret-a' }))).toEqual({ ok: false, reason: 'invalid_key' });
  });

  it('trims whitespace in the configured list and presented key', () => {
    process.env.CAIMS_API_KEYS = ' secret-a , secret-b ';
    expect(checkApiKey(headersOf({ 'x-api-key': 'secret-b' }))).toEqual({ ok: true, mode: 'keyed' });
  });

  it('empty CAIMS_API_KEYS entries do not create an empty valid key', () => {
    process.env.CAIMS_API_KEYS = ' , ,';
    // list is effectively empty -> open mode, NOT "empty string is a key"
    expect(checkApiKey(headersOf({}))).toEqual({ ok: true, mode: 'open' });
  });

  it('bearer parsing is case-insensitive on the scheme', () => {
    process.env.CAIMS_API_KEYS = 'k1';
    expect(checkApiKey(headersOf({ authorization: 'bearer k1' }))).toEqual({ ok: true, mode: 'keyed' });
  });
});
