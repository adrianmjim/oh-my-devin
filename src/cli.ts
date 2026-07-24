#!/usr/bin/env node
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import type { Interface } from 'node:readline';
import { discoverRoles } from './catalog/discover-roles';
import { loadCouncilDeclaration } from './council/load-council-declaration';
import type { CouncilDeclaration } from './council/council-declaration';
import { createEchoClusterer } from './deliberation/create-echo-clusterer';
import { createEvidenceSummarizer } from './deliberation/create-evidence-summarizer';
import { createPipelineLauncher } from './deliberation/create-pipeline-launcher';
import { createProcessSeatDeps } from './deliberation/create-process-seat-deps';
import { createProposerAction } from './deliberation/create-proposer-action';
import { createSeatInvoker } from './deliberation/create-seat-invoker';
import type { DeliberationOutcome } from './deliberation/deliberation-outcome';
import { exitCodeForClosure } from './deliberation/exit-code-for-closure';
import { persistDecisionRecord } from './deliberation/persist-decision-record';
import { renderDeliberationOutcome } from './deliberation/render-deliberation-outcome';
import { renderDeliberationOutcomeJson } from './deliberation/render-deliberation-outcome-json';
import { runDeliberation } from './deliberation/run-deliberation';
import type { SeatSessionDeps } from './deliberation/seat-session-deps';
import { renderRoleShowJson } from './catalog/render-role-show-json';
import { renderRoleShowText } from './catalog/render-role-show-text';
import { renderRolesListJson } from './catalog/render-roles-list-json';
import { renderRolesListText } from './catalog/render-roles-list-text';
import type { RoleDiscovery } from './catalog/role-discovery';
import type { CliCommand } from './cli/cli-command';
import type { CliErrorRendering } from './cli/cli-error-rendering';
import { parseCliArgs } from './cli/parse-cli-args';
import { readProposalFile } from './cli/read-proposal-file';
import { renderCliError } from './cli/render-cli-error';
import { reportVersion } from './cli/report-version';
import { runDoctor } from './doctor/run-doctor';
import type { DoctorReport } from './doctor/doctor-report';
import { ProcessCommandRunner } from './engine/process-command-runner';
import { readRequirements } from './handoff/read-requirements';
import { exitCodeForOutcome } from './outcome/exit-code-for-outcome';
import { renderHumanReport } from './outcome/render-human-report';
import { renderJsonReport } from './outcome/render-json-report';
import type { RunReport } from './outcome/run-report';
import { createRunRecorder } from './observability/create-run-recorder';
import { generateRunId } from './observability/generate-run-id';
import { LIVENESS_STALL_THRESHOLD_MS } from './observability/liveness-timing';
import { loadRunSnapshot } from './observability/load-run-snapshot';
import { renderSnapshotHuman } from './observability/render-snapshot-human';
import { renderSnapshotJson } from './observability/render-snapshot-json';
import { resolveRunId } from './observability/resolve-run-id';
import type { RunId } from './observability/run-id';
import { RUN_ID_ENV } from './observability/run-id-env';
import type { RunObserver } from './observability/run-observer';
import { RunRecordPaths } from './observability/run-record-paths';
import type { RunSnapshot } from './observability/run-snapshot';
import { createProcessStageRunner } from './pipeline/create-process-stage-runner';
import { createStdinGate } from './pipeline/create-stdin-gate';
import { exitCodeForPipelineOutcome } from './pipeline/exit-code-for-pipeline-outcome';
import type { PipelineReport } from './pipeline/pipeline-report';
import { renderPipelineReport } from './pipeline/render-pipeline-report';
import { renderPipelineReportJson } from './pipeline/render-pipeline-report-json';
import { runPipeline } from './pipeline/run-pipeline';
import type { RunPipelineOptions } from './pipeline/run-pipeline-options';
import { buildPluginBundle } from './plugin/build-plugin-bundle';
import { ModeStateStore } from './modes/mode-state-store';
import { resolveModeState } from './modes/resolve-mode-state';
import { loadRoleDefinition } from './role/load-role-definition';
import type { RoleDefinition } from './role/role-definition';
import { launchDetached } from './run/launch-detached';
import { renderDetachedLaunchJson } from './run/render-detached-launch-json';
import { resolveRunInvocation } from './run/resolve-run-invocation';
import type { ResolvedRunInvocation } from './run/resolved-run-invocation';
import { runRole } from './run/run-role';
import { UsageError } from './run/usage-error';
import type { ModeState } from './setup/mode-state';
import { setupLayer } from './setup/setup-layer';
import type { SetupResult } from './setup/setup-result';
import { loadTeamDefinition } from './team/load-team-definition';
import type { TeamDefinition } from './team/team-definition';
import { WorktreePool } from './worktree/worktree-pool';

const USAGE: string = [
  'omd — an organizational layer over the Devin CLI',
  '',
  'Usage:',
  '  omd run <role> "<task>" [--json] [--detach]   Run a role against a task end to end',
  '  omd status <run-id> [--json]                  Show a bounded snapshot of a run',
  '  omd doctor                                    Check the local runtime contract',
  '  omd roles list [--json]                       List the project’s roles',
  '  omd roles show <role> [--json]                Show a role’s expanded contract',
  '  omd setup [--scope=<parts>]                   Install the in-session layer (parts: rules,roles,skills,hooks)',
  '  omd plugin build [--out <dir>]                Build the installable devin plugin bundle',
  '  omd team run <team> "<task>"                  Run a team pipeline (architect → executor → reviewer)',
  '  omd council run <c> "<question>"              Run a deliberation council [--proposal <path>] [--then <team>] [--sign] [--json]',
  '  omd mode <set|clear> [<mode>]                 Set or clear the persistent mode state read by the session hooks',
  '  omd --version                                 Print the installed omd version',
  '',
].join('\n');

function write(stream: NodeJS.WriteStream, text: string): void {
  stream.write(text.endsWith('\n') ? text : `${text}\n`);
}

function reportLaunchIdentity(
  command: string,
  runId: RunId,
  json: boolean,
): void {
  write(
    json ? process.stderr : process.stdout,
    `${command} — launched (run ${runId})`,
  );
}

async function dispatch(
  command: CliCommand,
  cwd: string,
  runner: ProcessCommandRunner,
): Promise<number> {
  switch (command.kind) {
    case 'help':
      write(process.stdout, USAGE);
      return 0;
    case 'version':
      write(process.stdout, await reportVersion());
      return 0;
    case 'run': {
      if (command.detach) {
        const launchedId: RunId = await launchDetached(
          cwd,
          process.argv[1] ?? '',
          command.role,
          command.task,
        );
        write(
          process.stdout,
          command.json
            ? JSON.stringify(renderDetachedLaunchJson(launchedId))
            : launchedId,
        );
        return 0;
      }
      const resolved: ResolvedRunInvocation = await resolveRunInvocation(
        cwd,
        command.role,
        command.task,
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
      write(
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
      write(
        process.stdout,
        command.json
          ? JSON.stringify(renderSnapshotJson(snapshot))
          : renderSnapshotHuman(snapshot),
      );
      return 0;
    }
    case 'doctor': {
      const report: DoctorReport = await runDoctor({
        runner,
        nodeVersion: process.versions.node,
      });
      for (const check of report.checks) {
        write(
          process.stdout,
          `[${check.outcome}] ${check.name}: ${check.message}`,
        );
      }
      return report.exitCode;
    }
    case 'roles-list': {
      const discovery: RoleDiscovery = await discoverRoles(cwd);
      for (const error of discovery.errors) {
        write(process.stderr, `! ${error.name}: ${error.message}`);
      }
      write(
        process.stdout,
        command.json
          ? JSON.stringify(renderRolesListJson(discovery.roles))
          : renderRolesListText(discovery),
      );
      return 0;
    }
    case 'roles-show': {
      const role: RoleDefinition = await resolveRole(cwd, command.role);
      write(
        process.stdout,
        command.json
          ? JSON.stringify(renderRoleShowJson(role))
          : renderRoleShowText(role),
      );
      return 0;
    }
    case 'setup': {
      const result: SetupResult = await setupLayer(
        cwd,
        command.scope ?? undefined,
      );
      write(process.stdout, `Installed ${result.writtenPaths.length} files:`);
      for (const path of result.writtenPaths) {
        write(process.stdout, `  ${path}`);
      }
      return 0;
    }
    case 'plugin-build': {
      const outDir: string = resolve(
        cwd,
        command.out ?? join('.omd', 'plugin'),
      );
      await buildPluginBundle(outDir);
      write(process.stdout, outDir);
      return 0;
    }
    case 'team-run': {
      const team: TeamDefinition = await loadTeamDefinition(cwd, command.team);
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
          runStage: createProcessStageRunner(cwd),
          gate: createStdinGate(reader, (text: string): void => {
            write(process.stdout, text);
          }),
          runId,
          observer,
          clock,
          ...(requirements === null ? {} : { requirements }),
        };
        const report: PipelineReport = await runPipeline(options);
        write(
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
        cwd,
        command.council,
      );
      const team: TeamDefinition | null =
        command.team !== null
          ? await loadTeamDefinition(cwd, command.team)
          : null;
      const seatDeps: SeatSessionDeps = createProcessSeatDeps(cwd);
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
            runStage: createProcessStageRunner(cwd),
            gate: createStdinGate(reader, (text: string): void => {
              write(process.stdout, text);
            }),
          }),
          clock: (): number => Date.now(),
        });
        await persistDecisionRecord(
          cwd,
          deliberationId(command.question),
          outcome.record,
        );
        write(
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
      await new ModeStateStore(cwd).set(state);
      write(process.stdout, `mode set: ${state.mode}`);
      return 0;
    }
    case 'mode-clear': {
      await new ModeStateStore(cwd).clear();
      write(process.stdout, 'mode cleared');
      return 0;
    }
  }
}

function deliberationId(question: string): string {
  const slug: string = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${slug.length > 0 ? slug : 'deliberation'}-${Date.now()}`;
}

async function resolveRole(cwd: string, name: string): Promise<RoleDefinition> {
  try {
    return await loadRoleDefinition(cwd, name);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error ? error.message : `unknown role "${name}"`,
    );
  }
}

async function main(): Promise<number> {
  const command: CliCommand = parseCliArgs(process.argv.slice(2));
  const cwd: string = process.cwd();
  const runner: ProcessCommandRunner = new ProcessCommandRunner(cwd);
  return dispatch(command, cwd, runner);
}

main()
  .then((code: number): void => {
    process.exitCode = code;
  })
  .catch((error: unknown): void => {
    const rendering: CliErrorRendering = renderCliError(
      error,
      process.argv.slice(2).includes('--json'),
    );
    write(process.stderr, rendering.stderrText);
    process.exitCode = rendering.exitCode;
  });
