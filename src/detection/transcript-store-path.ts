import { join } from 'node:path';

export function transcriptStorePath(
  env: NodeJS.ProcessEnv,
  homeDir: string,
): string {
  const exported: string = (env['CHISEL_SESSION_DB'] ?? '').trim();
  return exported === ''
    ? join(homeDir, '.local', 'share', 'devin', 'cli', 'sessions.db')
    : exported;
}
