import { logger } from '../logger';

// ALL diagnostics go to STDERR: stdout is reserved for program output
// (the caims CLI's --format json contract depends on it). warn keeps
// console.warn (also stderr in Node); everything else uses console.error.

describe('logger', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe('dev mode (NODE_ENV !== production)', () => {
    it('never writes to stdout (console.log)', () => {
      logger.debug('d');
      logger.info('i');
      logger.warn('w');
      logger.error('e');
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('logs debug messages to stderr with formatted output', () => {
      logger.debug('test debug');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0]).toContain('[DEBUG] test debug');
    });

    it('logs info messages to stderr', () => {
      logger.info('test info');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0]).toContain('[INFO] test info');
    });

    it('logs warn messages to console.warn (stderr)', () => {
      logger.warn('test warn');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toContain('[WARN] test warn');
    });

    it('logs error messages to console.error', () => {
      logger.error('test error');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0][0]).toContain('[ERROR] test error');
    });

    it('includes data in formatted output', () => {
      logger.info('with data', { key: 'value', count: 42 });
      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('[INFO] with data');
      expect(output).toContain('"key":"value"');
      expect(output).toContain('"count":42');
    });

    it('omits data section when data is empty object', () => {
      logger.info('no data', {});
      const output = errorSpy.mock.calls[0][0];
      expect(output).toContain('[INFO] no data');
      // Empty object should not add JSON suffix
      expect(output).not.toContain('{');
    });

    it('includes ISO timestamp', () => {
      logger.info('timestamped');
      const output = errorSpy.mock.calls[0][0];
      // ISO timestamp format: 2026-04-06T...
      expect(output).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('production mode (NODE_ENV === production)', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      (process.env as Record<string, string>).NODE_ENV = 'production';
    });

    afterEach(() => {
      (process.env as Record<string, string>).NODE_ENV = originalEnv!;
    });

    it('outputs structured JSON to stderr for info level', () => {
      logger.info('prod info', { service: 'caims' });
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).not.toHaveBeenCalled();
      const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('prod info');
      expect(parsed.data.service).toBe('caims');
      expect(parsed.timestamp).toBeDefined();
    });

    it('outputs structured JSON to console.error for error level', () => {
      logger.error('prod error');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('prod error');
    });

    it('outputs warn level to stderr in production', () => {
      logger.warn('prod warn');
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).not.toHaveBeenCalled();
      const parsed = JSON.parse(errorSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('warn');
    });
  });
});
