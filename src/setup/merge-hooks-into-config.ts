import type { HooksEventMap } from './setup-templates';

function parseExistingConfig(existing: string | null): Record<string, unknown> {
  if (existing === null || existing.trim() === '') {
    return {};
  }
  const parsed: unknown = JSON.parse(existing);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('existing config.json is not a JSON object');
  }
  return parsed as Record<string, unknown>;
}

export function mergeHooksIntoConfig(
  existing: string | null,
  hooksMap: HooksEventMap,
): string {
  const base: Record<string, unknown> = parseExistingConfig(existing);
  const merged: Record<string, unknown> = { ...base, hooks: hooksMap };
  return `${JSON.stringify(merged, null, 2)}\n`;
}
