import { artifactState } from './artifact-state';
import { outcomeDetail } from './outcome-detail';
import type { RunSnapshot } from './run-snapshot';

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
