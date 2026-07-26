import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { MergeOutcome } from '../ownership/merge-outcome';
import { mergeOutcomeReason } from './merge-outcome-reason';
import type { MergeTarget } from './merge-target';
import type { RegistryTarget } from './registry-target';
import type { TargetReport } from './target-report';

export async function applyMergeOutcome(
  target: MergeTarget | RegistryTarget,
  outcome: MergeOutcome,
): Promise<TargetReport> {
  if (outcome.kind === 'created' || outcome.kind === 'updated') {
    await mkdir(dirname(target.absolutePath), { recursive: true });
    await writeFile(target.absolutePath, outcome.content, 'utf8');
  }
  return {
    component: target.component,
    path: target.reportPath,
    outcome: outcome.kind,
    reason: mergeOutcomeReason(outcome),
  };
}
