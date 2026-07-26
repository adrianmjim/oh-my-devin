import { VERSION_PATTERN } from './version-pattern';

export function parseDevinVersion(stdout: string): string | null {
  const match: RegExpExecArray | null = VERSION_PATTERN.exec(stdout);
  return match?.[1] ?? null;
}
