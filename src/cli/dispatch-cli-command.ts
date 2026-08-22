import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import type { Interface } from 'node:readline';
import { discoverRoles } from '../catalog/discover-roles';
import { renderRoleShowJson } from '../catalog/render-role-show-json';
import { renderRoleShowText } from '../catalog/render-role-show-text';
import { renderRolesListJson } from '../catalog/render-roles-list-json';
import { renderRolesListText } from '../catalog/render-roles-list-text';
import type { RoleDiscovery } from '../catalog/role-discovery';
import type { CouncilDeclaration } from '../council/council-declaration';
import { loadCouncilDeclaration } from '../council/load-council-declaration';
import { createEchoClusterer } from '../deliberation/create-echo-clusterer';
import { createEvidenceSummarizer } from '../deliberation/create-evidence-summarizer';
import { createPipelineLauncher } from '../deliberation/create-pipeline-launcher';
import { createProcessSeatDeps } from '../deliberation/create-process-seat-deps';
import { createProposerAction } from '../deliberation/create-proposer-action';
import { createSeatInvoker } from '../deliberation/create-seat-invoker';
import type { DeliberationOutcome } from '../deliberation/deliberation-outcome';
import { exitCodeForClosure } from '../deliberation/exit-code-for-closure';
import { persistDecisionRecord } from '../deliberation/persist-decision-record';
import { renderDeliberationOutcome } from '../deliberation/render-deliberation-outcome';
import { renderDeliberationOutcomeJson } from '../deliberation/render-deliberation-outcome-json';
import { runDeliberation } from '../deliberation/run-deliberation';
import type { SeatSessionDeps } from '../deliberation/seat-session-deps';
import type { DoctorReport } from '../doctor/doctor-report';
import { runDoctor } from '../doctor/run-doctor';
import { stageDetectedMoments } from '../detection/stage-detected-moments';
import { transcriptStorePath } from '../detection/transcript-store-path';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import { readRequirements } from '../handoff/read-requirements';
import type { LayerLookup } from '../layer/layer-lookup';
import { appendNotepadEntry } from '../memory/append-notepad-entry';
import { clearSessionMode } from '../modes/clear-session-mode';
import { deriveAmbientContext } from '../modes/derive-ambient-context';
import { deriveStopDecision } from '../modes/derive-stop-decision';
import { discoverModeBaseDir } from '../modes/discover-mode-base-dir';
import { handleToolUseEvent } from '../modes/handle-tool-use-event';
import type { HookEvent } from '../modes/hook-event';
import type { ModeReport } from '../modes/mode-report';
import { parseHookEvent } from '../modes/parse-hook-event';
import { recordSessionSeen } from '../modes/record-session-seen';
import { renderModeReport } from '../modes/render-mode-report';
import { renderStopOutput } from '../modes/render-stop-output';
import { setSessionMode } from '../modes/set-session-mode';
import { resolveModeState } from '../modes/resolve-mode-state';
import { createRunRecorder } from '../observability/create-run-recorder';
import { deriveRunListing } from '../observability/derive-run-listing';
import { generateRunId } from '../observability/generate-run-id';
import { LIVENESS_STALL_THRESHOLD_MS } from '../observability/liveness-stall-threshold-ms';
import { loadRunSnapshot } from '../observability/load-run-snapshot';
import { renderRunListing } from '../observability/render-run-listing';
import { renderRunListingJson } from '../observability/render-run-listing-json';
import { renderSnapshotHuman } from '../observability/render-snapshot-human';
import { renderSnapshotJson } from '../observability/render-snapshot-json';
import { resolveRunId } from '../observability/resolve-run-id';
import type { RunId } from '../observability/run-id';
import { RUN_ID_ENV } from '../observability/run-id-env';
import type { RunListing } from '../observability/run-listing';
import type { RunObserver } from '../observability/run-observer';
import { RunRecordPaths } from '../observability/run-record-paths';
import type { RunSnapshot } from '../observability/run-snapshot';
import { exitCodeForOutcome } from '../outcome/exit-code-for-outcome';
import { renderHumanReport } from '../outcome/render-human-report';
import { renderJsonReport } from '../outcome/render-json-report';
import type { RunReport } from '../outcome/run-report';
import { createProcessStageRunner } from '../pipeline/create-process-stage-runner';
import { createStdinGate } from '../pipeline/create-stdin-gate';
import { exitCodeForPipelineOutcome } from '../pipeline/exit-code-for-pipeline-outcome';
import type { PipelineReport } from '../pipeline/pipeline-report';
import { renderPipelineReport } from '../pipeline/render-pipeline-report';
import { renderPipelineReportJson } from '../pipeline/render-pipeline-report-json';
import { runPipeline } from '../pipeline/run-pipeline';
import type { RunPipelineOptions } from '../pipeline/run-pipeline-options';
import { buildPluginBundle } from '../plugin/build-plugin-bundle';
import type { RoleDefinition } from '../role/role-definition';
import { launchDetached } from '../run/launch-detached';
import { renderDetachedLaunchJson } from '../run/render-detached-launch-json';
import { resolveRunInvocation } from '../run/resolve-run-invocation';
import type { ResolvedRunInvocation } from '../run/resolved-run-invocation';
import { runRole } from '../run/run-role';
import { elicitSetupOptions } from '../setup/elicit-setup-options';
import type { ElicitedSetupOptions } from '../setup/elicited-setup-options';
import type { ModeState } from '../setup/mode-state';
import { renderSetupResult } from '../setup/render-setup-result';
import { setupLayer } from '../setup/setup-layer';
import { STOP_PHASE } from '../setup/stop-phase';
import { TOOL_USE_PHASE } from '../setup/tool-use-phase';
import { USER_PROMPT_PHASE } from '../setup/user-prompt-phase';
import type { SetupResult } from '../setup/setup-result';
import type { TeamDefinition } from '../team/team-definition';
import { loadTeamDefinition } from '../team/load-team-definition';
import { WorktreePool } from '../worktree/worktree-pool';
import type { CliCommand } from './cli-command';
import { CLI_USAGE } from './cli-usage';
import { deliberationId } from './deliberation-id';
import { isInteractiveSession } from './is-interactive-session';
import { readProposalFile } from './read-proposal-file';
import { readStdinText } from './read-stdin-text';
import { reportLaunchIdentity } from './report-launch-identity';
import { reportVersion } from './report-version';
import { resolveRole } from './resolve-role';
import { writeStreamLine } from './write-stream-line';

export async function dispatchCliCommand(
  command: CliCommand,
  cwd: string,
  userConfigDir: string,
  runner: ProcessCommandRunner,
): Promise<number> {
  const lookup: LayerLookup = { projectDir: cwd, userConfigDir };
  switch (command.kind) {
    case 'help':
      writeStreamLine(process.stdout, CLI_USAGE);
      return 0;
    case 'version':
      writeStreamLine(process.stdout, await reportVersion());
      return 0;
    case 'run': {
      if (command.detach) {
        const launchedId: RunId = await launchDetached(
          lookup,
          process.argv[1] ?? '',
          command.role,
          command.task,
        );
        writeStreamLine(
          process.stdout,
          command.json
            ? JSON.stringify(renderDetachedLaunchJson(launchedId))
            : launchedId,
        );
        return 0;
      }
      const resolved: ResolvedRunInvocation = await resolveRunInvocation(
        lookup,
        command.role,
        command.task,
        { workingDirectory: cwd, provisionedWorktree: false },
      );
      const runId: RunId = resolveRunId(process.env[RUN_ID_ENV]);
      const clock = (): number => Date.now();
      const recorder: RunObserver = createRunRecorder(cwd, runId, clock);
      await mkdir(new RunRecordPaths(cwd, runId).dir, { recursive: true });
      reportLaunchIdentity('omd run', runId, command.json);
      const report: RunReport = await runRole({
        roleName: command.role,
        task: command.task,
        workingDirectory: cwd,
        model: null,
        runner,
        clock,
        runId,
        recorder,
        resolved,
      });
      writeStreamLine(
        process.stdout,
        command.json
          ? JSON.stringify(renderJsonReport(report))
          : renderHumanReport(report),
      );
      return exitCodeForOutcome(report.failureTier);
    }
    case 'status': {
      const snapshot: RunSnapshot = await loadRunSnapshot(
        cwd,
        command.runId,
        Date.now(),
        LIVENESS_STALL_THRESHOLD_MS,
      );
      writeStreamLine(
        process.stdout,
        command.json
          ? JSON.stringify(renderSnapshotJson(snapshot))
          : renderSnapshotHuman(snapshot),
      );
      return 0;
    }
    case 'status-list': {
      const listing: RunListing = await deriveRunListing(
        cwd,
        Date.now(),
        LIVENESS_STALL_THRESHOLD_MS,
      );
      writeStreamLine(
        process.stdout,
        command.json
          ? JSON.stringify(renderRunListingJson(listing))
          : renderRunListing(listing),
      );
      return 0;
    }
    case 'doctor': {
      const report: DoctorReport = await runDoctor({
        runner,
        nodeVersion: process.versions.node,
      });
      for (const check of report.checks) {
        writeStreamLine(
          process.stdout,
          `[${check.outcome}] ${check.name}: ${check.message}`,
        );
      }
      return report.exitCode;
    }
    case 'roles-list': {
      const discovery: RoleDiscovery = await discoverRoles(lookup);
      for (const error of discovery.errors) {
        writeStreamLine(process.stderr, `! ${error.name}: ${error.message}`);
      }
      writeStreamLine(
        process.stdout,
        command.json
          ? JSON.stringify(renderRolesListJson(discovery.roles))
          : renderRolesListText(discovery),
      );
      return 0;
    }
    case 'roles-show': {
      const role: RoleDefinition = await resolveRole(lookup, command.role);
      writeStreamLine(
        process.stdout,
        command.json
          ? JSON.stringify(renderRoleShowJson(role))
          : renderRoleShowText(role),
      );
      return 0;
    }
    case 'setup': {
      const interactive: boolean = isInteractiveSession(
        process.stdin.isTTY,
        process.stdout.isTTY,
      );
      const elicited: ElicitedSetupOptions = await elicitSetupOptions({
        input: process.stdin,
        output: process.stdout,
        interactive,
        level: command.level,
        scope: command.scope,
      });
      const result: SetupResult = await setupLayer(cwd, {
        level: elicited.level,
        userConfigDir,
        ...(elicited.scope !== null ? { scope: elicited.scope } : {}),
      });
      writeStreamLine(process.stdout, renderSetupResult(result));
      return 0;
    }
    case 'plugin-build': {
      const outDir: string = resolve(
        cwd,
        command.out ?? join('.omd', 'plugin'),
      );
      await buildPluginBundle(outDir);
      writeStreamLine(process.stdout, outDir);
      return 0;
    }
    case 'team-run': {
      const team: TeamDefinition = await loadTeamDefinition(
        lookup,
        command.team,
      );
      const requirements: string | null = await readRequirements(cwd);
      const runId: RunId = generateRunId();
      const clock = (): number => Date.now();
      const observer: RunObserver = createRunRecorder(cwd, runId, clock);
      await mkdir(new RunRecordPaths(cwd, runId).dir, { recursive: true });
      const reader: Interface = createInterface({ input: process.stdin });
      reportLaunchIdentity('omd team run', runId, command.json);
      try {
        const options: RunPipelineOptions = {
          team,
          task: command.task,
          runStage: createProcessStageRunner(cwd, userConfigDir),
          gate: createStdinGate(reader, (text: string): void => {
            writeStreamLine(process.stdout, text);
          }),
          runId,
          observer,
          clock,
          ...(requirements === null ? {} : { requirements }),
        };
        const report: PipelineReport = await runPipeline(options);
        writeStreamLine(
          process.stdout,
          command.json
            ? JSON.stringify(renderPipelineReportJson(report))
            : renderPipelineReport(report),
        );
        return exitCodeForPipelineOutcome(report.outcome);
      } finally {
        reader.close();
      }
    }
    case 'council-run': {
      const proposal: string | null =
        command.proposal !== null
          ? await readProposalFile(cwd, command.proposal)
          : null;
      const council: CouncilDeclaration = await loadCouncilDeclaration(
        lookup,
        command.council,
      );
      const team: TeamDefinition | null =
        command.team !== null
          ? await loadTeamDefinition(lookup, command.team)
          : null;
      const seatDeps: SeatSessionDeps = createProcessSeatDeps(
        cwd,
        userConfigDir,
      );
      const seatWorktrees: WorktreePool = new WorktreePool(seatDeps.worktrees);
      const reader: Interface = createInterface({ input: process.stdin });
      try {
        const outcome: DeliberationOutcome = await runDeliberation({
          council,
          question: command.question,
          attachedProposal: proposal,
          team,
          humanSigned: command.sign,
          seatInvoker: createSeatInvoker(seatDeps, seatWorktrees),
          proposerAction: createProposerAction(seatDeps, seatWorktrees),
          clusterArguments: createEchoClusterer(runner),
          summarizeEvidence: createEvidenceSummarizer(runner),
          launch: createPipelineLauncher({
            runStage: createProcessStageRunner(cwd, userConfigDir),
            gate: createStdinGate(reader, (text: string): void => {
              writeStreamLine(process.stdout, text);
            }),
          }),
          clock: (): number => Date.now(),
        });
        await persistDecisionRecord(
          cwd,
          deliberationId(command.question),
          outcome.record,
        );
        writeStreamLine(
          process.stdout,
          command.json
            ? JSON.stringify(renderDeliberationOutcomeJson(outcome))
            : renderDeliberationOutcome(outcome),
        );
        return exitCodeForClosure(outcome.record.consent);
      } finally {
        await seatWorktrees.closeAll();
        reader.close();
      }
    }
    case 'mode-set': {
      const state: ModeState = resolveModeState(command.mode);
      const report: ModeReport = await setSessionMode(
        await discoverModeBaseDir(cwd),
        state.mode,
        command.runId,
        command.invocation,
        Date.now(),
      );
      writeStreamLine(process.stdout, renderModeReport(report));
      return report.kind === 'refused' ? 1 : 0;
    }
    case 'mode-clear': {
      const target: string | null =
        command.mode === null ? null : resolveModeState(command.mode).mode;
      const report: ModeReport = await clearSessionMode(
        await discoverModeBaseDir(cwd),
        target,
        command.invocation,
        Date.now(),
      );
      writeStreamLine(process.stdout, renderModeReport(report));
      return report.kind === 'refused' ? 1 : 0;
    }
    case 'hook': {
      const event: HookEvent = parseHookEvent(
        await readStdinText(process.stdin),
      );
      const at: number = Date.now();
      const baseDir: string = await discoverModeBaseDir(cwd);
      let output: Record<string, unknown>;
      if (command.phase === TOOL_USE_PHASE) {
        await handleToolUseEvent(baseDir, event, at, process.env);
        output = {};
      } else {
        if (event.sessionId !== null) {
          await recordSessionSeen(baseDir, event.sessionId, at);
        }
        const prompt: string = event.prompt ?? '';
        if (command.phase === USER_PROMPT_PHASE) {
          await stageDetectedMoments(
            baseDir,
            event.sessionId,
            prompt,
            transcriptStorePath(process.env, homedir()),
            at,
          );
        }
        output =
          command.phase === STOP_PHASE
            ? renderStopOutput(
                await deriveStopDecision(baseDir, event.sessionId, at),
              )
            : {
                hookSpecificOutput: {
                  additionalContext: await deriveAmbientContext(
                    baseDir,
                    {
                      sessionId: event.sessionId,
                      prompt,
                      phase:
                        command.phase === USER_PROMPT_PHASE
                          ? 'prompt-submission'
                          : 'session-start',
                    },
                    at,
                  ),
                },
              };
      }
      writeStreamLine(process.stdout, JSON.stringify(output));
      return 0;
    }
    case 'memory-remember': {
      await appendNotepadEntry(cwd, 'manual', command.text, Date.now());
      writeStreamLine(process.stdout, `remembered: ${command.text}`);
      return 0;
    }
  }
}
