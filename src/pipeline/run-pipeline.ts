import { ArtifactStore } from '../handoff/artifact-store';
import { composeStageInputs } from '../handoff/compose-stage-inputs';
import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { PipelineStage } from '../handoff/pipeline-stage';
import { isPipelineStage } from '../handoff/is-pipeline-stage';
import { generateRunId } from '../observability/generate-run-id';
import type { RunId } from '../observability/run-id';
import type { RunObserver } from '../observability/run-observer';
import { composeRequirements } from './compose-requirements';
import { entryStage } from './entry-stage';
import type { GateDecision } from './gate-decision';
import type { PipelineReport } from './pipeline-report';
import { pipelineNow } from './pipeline-now';
import { recordTerminalOutcome } from './record-terminal-outcome';
import { resolveSuccessor } from './resolve-successor';
import type { RunPipelineOptions } from './run-pipeline-options';
import type { StageRecord } from './stage-record';
import type { StageResult } from './stage-result';
import { stageTransition } from './stage-transition';
import { TERMINAL_NODE } from './terminal-node';
import { terminatePipeline } from './terminate-pipeline';

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
      timestamp: pipelineNow(options),
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
        timestamp: pipelineNow(options),
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
        timestamp: pipelineNow(options),
        stage: current,
        stageIndex,
        valid: stageValid,
        failureTier: result.report.failureTier,
      });

      if (!stageValid) {
        records.push({ stage: current, report: result.report, decision: null });
        await recordTerminalOutcome(
          observer,
          pipelineNow(options),
          false,
          result.report.failureTier,
        );
        return terminatePipeline(options, runId, records, 'halted', current);
      }

      for (const [name, content] of result.produced) {
        store.set(name, content);
      }

      await observer?.append({
        type: 'gateWaitEntered',
        timestamp: pipelineNow(options),
        stage: current,
      });
      const decision: GateDecision = await options.gate({
        stage: current,
        report: result.report,
      });
      await observer?.append({
        type: 'gateWaitResolved',
        timestamp: pipelineNow(options),
        stage: current,
        decision,
      });
      records.push({ stage: current, report: result.report, decision });

      const successor: string | null = resolveSuccessor(
        stageTransition(options.team, current),
        decision,
      );

      if (successor === TERMINAL_NODE) {
        await recordTerminalOutcome(observer, pipelineNow(options), true, null);
        return terminatePipeline(options, runId, records, 'succeeded', null);
      }
      if (successor === null || !isPipelineStage(successor)) {
        await recordTerminalOutcome(
          observer,
          pipelineNow(options),
          false,
          null,
        );
        return terminatePipeline(options, runId, records, 'halted', current);
      }
      current = successor;
      stageIndex += 1;
    }
  } catch (error: unknown) {
    await recordTerminalOutcome(
      observer,
      pipelineNow(options),
      false,
      null,
    ).catch((): void => undefined);
    throw error;
  } finally {
    observer?.close();
  }
}
