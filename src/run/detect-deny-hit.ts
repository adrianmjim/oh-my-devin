import type { SessionTurnResult } from '../session/session-turn-result';

const DENY_SIGNALS: readonly RegExp[] = [
  /a tool was rejected by the user/i,
  /rejected by (?:a |the )?deny rule/i,
];

export function detectDenyHit(result: SessionTurnResult): string | null {
  if (result.exitCode === 0) {
    return null;
  }
  const matched: boolean = DENY_SIGNALS.some((pattern: RegExp): boolean =>
    pattern.test(result.stderr),
  );
  if (!matched) {
    return null;
  }
  const firstLine: string | undefined = result.stderr
    .split('\n')
    .map((line: string): string => line.trim())
    .find((line: string): boolean => line.length > 0);
  return firstLine ?? 'deny rule';
}
