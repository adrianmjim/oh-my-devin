import { isAbsolute, join } from 'node:path';

export function devinTranscriptPath(
  xdgDataHome: string | undefined,
  homeDir: string,
  sessionId: string,
): string {
  const base: string =
    xdgDataHome !== undefined && isAbsolute(xdgDataHome)
      ? xdgDataHome
      : join(homeDir, '.local', 'share');
  return join(base, 'devin', 'cli', 'transcripts', `${sessionId}.json`);
}
