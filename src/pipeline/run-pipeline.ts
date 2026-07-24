import { ArtifactStore } from '../handoff/artifact-store';
import { composeStageInputs } from '../handoff/compose-stage-inputs';
import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { PipelineStage } from '../handoff/pipeline-stage';
import { isPipelineStage } from '../handoff/pipeline-stage';
import { generateRunId } from '../observability/generate-run-id';
import type { RunId } from '../observability/run-id';
import type { RunObserver } from '../observability/run-observer';
import type { FailureTier } from '../outcome/failure-tier';
import type { OutcomeTransition } from '../team/outcome-transition';
import type { TeamDefinition } from '../team/team-definition';
import type { TeamTransition } from '../team/team-transition';
import type { GateDecision } from './gate-decision';
import { PipelineError } from './pipeline-error';
import type { PipelineReport } from './pipeline-report';
import type { RunPipelineOptions } from './run-pipeline-options';
import type { StageRecord } from './stage-record';
import type { StageResult } from './stage-result';

const TERMINAL_NODE: string = 'done';
const APPROVE_OUTCOME: string = 'passed';
const REJECT_OUTCOME: string = 'blocked';

export async function runPipeline(
  options: RunPipelineOptions,
): Promise<PipelineReport> {
  const observer: RunObserver | undefined = options.observer;
  const runId: RunId = options.runId ?? generateRunId();

  const store: ArtifactStore = new ArtifactStore();
  store.set('requirements', composeRequirements(options));

  const records: StageRecord[] = [];
  let stageIndex: number = 0;

  try {
    await observer?.append({
      type: 'runLaunched',
      timestamp: now(options),
      runId,
      runKind: 'pipeline',
      subject: options.team.name,
      maxTurns: 0,
      artifactPath: null,
    });

    let current: PipelineStage = entryStage(options.team);
    for (;;) {
      await observer?.append({
        type: 'stageStarted',
        timestamp: now(options),
        stage: current,
        stageIndex,
      });
      const inputs: ReadonlyMap<HandoffArtifactName, string> =
        composeStageInputs(current, store);
      const result: StageResult = await options.runStage({
        stage: current,
        inputs,
      });
      const stageValid: boolean =
        result.report.failureTier === null && result.report.artifactValid;
      await observer?.append({
        type: 'stageCompleted',
        timestamp: now(options),
        stage: current,
        stageIndex,
        valid: stageValid,
        failureTier: result.report.failureTier,
      });

      if (!stageValid) {
        records.push({ stage: current, report: result.report, decision: null });
        await recordTerminal(
          observer,
          now(options),
          false,
          result.report.failureTier,
        );
        return terminate(options, runId, records, 'halted', current);
      }

      for (const [name, content] of result.produced) {
        store.set(name, content);
      }

      await observer?.append({
        type: 'gateWaitEntered',
        timestamp: now(options),
        stage: current,
      });
      const decision: GateDecision = await options.gate({
        stage: current,
        report: result.report,
      });
      await observer?.append({
        type: 'gateWaitResolved',
        timestamp: now(options),
        stage: current,
        decision,
      });
      records.push({ stage: current, report: result.report, decision });

      const successor: string | null = resolveSuccessor(
        transitionFor(options.team, current),
        decision,
      );

      if (successor === TERMINAL_NODE) {
        await recordTerminal(observer, now(options), true, null);
        return terminate(options, runId, records, 'succeeded', null);
      }
      if (successor === null || !isPipelineStage(successor)) {
        await recordTerminal(observer, now(options), false, null);
        return terminate(options, runId, records, 'halted', current);
      }
      current = successor;
      stageIndex += 1;
    }
  } catch (error: unknown) {
    await recordTerminal(observer, now(options), false, null).catch(
      (): void => undefined,
    );
    throw error;
  } finally {
    observer?.close();
  }
}

function now(options: RunPipelineOptions): number {
  return options.clock?.() ?? 0;
}

async function recordTerminal(
  observer: RunObserver | undefined,
  timestamp: number,
  succeeded: boolean,
  failureTier: FailureTier | null,
): Promise<void> {
  await observer?.append({
    type: 'terminalOutcome',
    timestamp,
    succeeded,
    failureTier,
  });
}

function composeRequirements(options: RunPipelineOptions): string {
  if (options.requirements === undefined) {
    return options.task;
  }
  return `${options.task}\n\n${options.requirements}`;
}

function entryStage(team: TeamDefinition): PipelineStage {
  const first: string | undefined = team.members[0]?.role;
  if (first === undefined || !isPipelineStage(first)) {
    throw new PipelineError(
      `team "${team.name}" does not start with an MVP-1 pipeline stage`,
    );
  }
  return first;
}

function transitionFor(
  team: TeamDefinition,
  stage: PipelineStage,
): TeamTransition | null {
  return (
    team.workflow.find(
      (transition: TeamTransition): boolean => transition.from === stage,
    ) ?? null
  );
}

function resolveSuccessor(
  transition: TeamTransition | null,
  decision: GateDecision,
): string | null {
  if (transition === null) {
    return null;
  }
  if (decision === 'approve') {
    return outcomeTarget(transition, APPROVE_OUTCOME) ?? transition.then;
  }
  if (decision === 'reject') {
    return outcomeTarget(transition, REJECT_OUTCOME) ?? null;
  }
  return null;
}

function outcomeTarget(
  transition: TeamTransition,
  outcome: string,
): string | undefined {
  return transition.outcomes.find(
    (candidate: OutcomeTransition): boolean => candidate.outcome === outcome,
  )?.to;
}

function terminate(
  options: RunPipelineOptions,
  runId: RunId,
  records: readonly StageRecord[],
  outcome: PipelineReport['outcome'],
  haltedAt: PipelineStage | null,
): PipelineReport {
  return {
    runId,
    team: options.team.name,
    task: options.task,
    outcome,
    stages: records,
    haltedAt,
  };
}
