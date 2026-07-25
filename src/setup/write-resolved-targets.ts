import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { mergeContainer } from '../ownership/merge-container';
import { mergeJsonDocument } from '../ownership/merge-json-document';
import type { MergeOutcome } from '../ownership/merge-outcome';
import type { MergeRequest } from '../ownership/merge-request';
import { mergeUnitFile } from '../ownership/merge-unit-file';
import { mergeHookRegistry } from './merge-hook-registry';
import type {
  MergeTarget,
  RegistryTarget,
  ResolvedTarget,
} from './resolved-target';
import type {
  SetupRefusal,
  SetupResult,
  TargetOutcome,
  TargetReport,
} from './setup-result';

export const UNOWNED_HOOK_SCRIPT_REASON: string =
  'its hook script was not installed by omd';

const CLAIMABLE_SCRIPT_OUTCOMES: ReadonlySet<TargetOutcome> =
  new Set<TargetOutcome>(['created', 'updated', 'unchanged', 'preserved']);

async function readIfExists(path: string): Promise<string | null> {
  let content: string | null;
  try {
    content = await readFile(path, 'utf8');
  } catch {
    content = null;
  }
  return content;
}

function mergeFile(target: MergeTarget, existing: string | null): MergeOutcome {
  const request: MergeRequest = { existing, framing: target.framing };
  let outcome: MergeOutcome;
  if (target.strategy === 'container') {
    outcome = mergeContainer(request);
  } else if (target.strategy === 'unit') {
    outcome = mergeUnitFile(request);
  } else {
    outcome = mergeJsonDocument(request);
  }
  return outcome;
}

function mergeRegistry(
  target: RegistryTarget,
  existing: string | null,
): MergeOutcome {
  return mergeHookRegistry({
    existing,
    shape: target.shape,
    hooksMap: target.hooksMap,
  });
}

function reasonOf(outcome: MergeOutcome): string | null {
  let reason: string | null;
  if (
    outcome.kind === 'preserved' ||
    outcome.kind === 'conflicted' ||
    outcome.kind === 'blocked'
  ) {
    reason = outcome.reason;
  } else {
    reason = null;
  }
  return reason;
}

async function applyOutcome(
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
    reason: reasonOf(outcome),
  };
}

function claimableScript(
  target: RegistryTarget,
  outcomes: ReadonlyMap<string, TargetOutcome>,
): boolean {
  const scriptOutcome: TargetOutcome | undefined = outcomes.get(
    target.scriptPath,
  );
  return (
    scriptOutcome !== undefined && CLAIMABLE_SCRIPT_OUTCOMES.has(scriptOutcome)
  );
}

async function resolveOutcome(
  target: MergeTarget | RegistryTarget,
  outcomes: ReadonlyMap<string, TargetOutcome>,
): Promise<MergeOutcome> {
  const existing: string | null = await readIfExists(target.absolutePath);
  let outcome: MergeOutcome;
  if (target.kind === 'merge') {
    outcome = mergeFile(target, existing);
  } else if (claimableScript(target, outcomes)) {
    outcome = mergeRegistry(target, existing);
  } else {
    outcome = { kind: 'blocked', reason: UNOWNED_HOOK_SCRIPT_REASON };
  }
  return outcome;
}

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
      const outcome: MergeOutcome = await resolveOutcome(target, outcomes);
      const report: TargetReport = await applyOutcome(target, outcome);
      outcomes.set(target.absolutePath, report.outcome);
      reports.push(report);
    }
  }
  return { targets: reports, refusals };
}
