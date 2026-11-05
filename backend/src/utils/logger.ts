/* eslint-disable no-console */
type Level = 'info' | 'warn' | 'error';

function log(level: Level, message: string, meta?: unknown): void {
  if (process.env.NODE_ENV === 'test' && level !== 'error') return;
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}`;
  const out = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  meta === undefined ? out(line) : out(line, meta);
}

export const logger = {
  info: (m: string, meta?: unknown) => log('info', m, meta),
  warn: (m: string, meta?: unknown) => log('warn', m, meta),
  error: (m: string, meta?: unknown) => log('error', m, meta),
};
