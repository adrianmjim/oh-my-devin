import type { MergeOutcome } from '../ownership/merge-outcome';
import { applyMergeOutcome } from './apply-merge-outcome';
import { resolveMergeOutcome } from './resolve-merge-outcome';
import type { ResolvedTarget } from './resolved-target';
import type { SetupRefusal } from './setup-refusal';
import type { SetupResult } from './setup-result';
import type { TargetOutcome } from './target-outcome';
import type { TargetReport } from './target-report';

export async function writeResolvedTargets(
  targets: readonly ResolvedTarget[],
): Promise<SetupResult> {
  const reports: TargetReport[] = [];
  const refusals: SetupRefusal[] = [];
  const outcomes: Map<string, TargetOutcome> = new Map<string, TargetOutcome>();
  for (const target of targets) {
    if (target.kind === 'refused') {
      refusals.push({ component: target.component, reason: target.reason });
    } else {
      const outcome: MergeOutcome = await resolveMergeOutcome(target, outcomes);
      const report: TargetReport = await applyMergeOutcome(target, outcome);
      outcomes.set(target.absolutePath, report.outcome);
      reports.push(report);
    }
  }
  return { targets: reports, refusals };
}
