import type { SetupResult } from './setup-result';

export function renderSetupResult(result: SetupResult): string {
  const lines: string[] = [`Installed ${result.writtenPaths.length} files:`];
  for (const path of result.writtenPaths) {
    lines.push(`  ${path}`);
  }
  for (const refusal of result.refusals) {
    lines.push(`  refused ${refusal.component}: ${refusal.reason}`);
  }
  return lines.join('\n');
}
