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
import type { SetupRefusal, SetupResult, TargetReport } from './setup-result';

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

export async function writeResolvedTargets(
  targets: readonly ResolvedTarget[],
): Promise<SetupResult> {
  const reports: TargetReport[] = [];
  const refusals: SetupRefusal[] = [];
  for (const target of targets) {
    if (target.kind === 'refused') {
      refusals.push({ component: target.component, reason: target.reason });
    } else {
      const existing: string | null = await readIfExists(target.absolutePath);
      const outcome: MergeOutcome =
        target.kind === 'merge'
          ? mergeFile(target, existing)
          : mergeRegistry(target, existing);
      reports.push(await applyOutcome(target, outcome));
    }
  }
  return { targets: reports, refusals };
}
