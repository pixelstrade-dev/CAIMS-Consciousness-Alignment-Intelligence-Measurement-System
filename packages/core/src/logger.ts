// GENERATED from apps/web/lib — do not edit here. Run: node scripts/sync-core.mjs
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

function formatEntry(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
  if (entry.data && Object.keys(entry.data).length > 0) {
    return `${base} ${JSON.stringify(entry.data)}`;
  }
  return base;
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  // ALL diagnostics go to stderr: stdout is reserved for program output.
  // The caims CLI's `--format json` contract depends on this — a logger
  // line on stdout would corrupt the machine-readable document (and log
  // aggregators read both streams anyway).
  if (process.env.NODE_ENV === 'production') {
    console.error(JSON.stringify(entry));
  } else {
    const output = level === 'warn' ? console.warn : console.error;
    output(formatEntry(entry));
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => log('debug', message, data),
  info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => log('error', message, data),
};
