import type { RunSnapshot } from './run-snapshot';

function artifactState(valid: boolean | null): string {
  if (valid === null) {
    return 'pending';
  }
  return valid ? 'valid' : 'invalid';
}

function outcomeDetail(snapshot: RunSnapshot): string {
  switch (snapshot.state) {
    case 'succeeded':
      return 'success';
    case 'failed':
      return `failure (${snapshot.failureTier ?? 'unknown'})`;
    case 'running':
      return 'in progress';
    case 'stalled':
      return 'stalled — no recent liveness';
    case 'awaiting-gate':
      return `awaiting gate at ${snapshot.pendingGate ?? '(unknown)'}`;
  }
}

export function renderSnapshotHuman(snapshot: RunSnapshot): string {
  const subjectLabel: string =
    snapshot.runKind === 'pipeline' ? 'team' : 'role';
  return [
    `omd status — ${snapshot.state}`,
    `run:      ${snapshot.runId}`,
    `kind:     ${snapshot.runKind}`,
    `${subjectLabel}:     ${snapshot.subject}`,
    `stage:    ${snapshot.currentStage ?? '(n/a)'}`,
    `turns:    ${snapshot.turnsUsed}/${snapshot.maxTurns}`,
    `artifact: ${snapshot.artifactPath ?? '(none)'} (${artifactState(snapshot.artifactValid)})`,
    `gate:     ${snapshot.pendingGate ?? '(none)'}`,
    `outcome:  ${outcomeDetail(snapshot)}`,
    `updated:  ${snapshot.lastEventAt}`,
  ].join('\n');
}
