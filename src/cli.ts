#!/usr/bin/env node
import { createInterface } from 'node:readline';
import type { Interface } from 'node:readline';
import { discoverRoles } from './catalog/discover-roles';
import { loadCouncilDeclaration } from './council/load-council-declaration';
import type { CouncilDeclaration } from './council/council-declaration';
import { createPipelineLauncher } from './deliberation/create-pipeline-launcher';
import { createProcessSeatDeps } from './deliberation/create-process-seat-deps';
import { createProposerAction } from './deliberation/create-proposer-action';
import { createSeatInvoker } from './deliberation/create-seat-invoker';
import type { DeliberationOutcome } from './deliberation/deliberation-outcome';
import { exitCodeForClosure } from './deliberation/exit-code-for-closure';
import { normalizeClaimKey } from './deliberation/normalize-claim-key';
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
import { parseCliArgs } from './cli/parse-cli-args';
import { runDoctor } from './doctor/run-doctor';
import type { DoctorReport } from './doctor/doctor-report';
import { ProcessCommandRunner } from './engine/process-command-runner';
import type { LineReader } from './io/line-reader';
import { exitCodeForOutcome } from './outcome/exit-code-for-outcome';
import { renderHumanReport } from './outcome/render-human-report';
import { renderJsonReport } from './outcome/render-json-report';
import type { RunReport } from './outcome/run-report';
import { USAGE_ERROR_EXIT_CODE } from './outcome/usage-error-exit-code';
import { createProcessStageRunner } from './pipeline/create-process-stage-runner';
import { createStdinGate } from './pipeline/create-stdin-gate';
import { exitCodeForPipelineOutcome } from './pipeline/exit-code-for-pipeline-outcome';
import type { PipelineReport } from './pipeline/pipeline-report';
import { renderPipelineReport } from './pipeline/render-pipeline-report';
import { renderPipelineReportJson } from './pipeline/render-pipeline-report-json';
import { runPipeline } from './pipeline/run-pipeline';
import { loadRoleDefinition } from './role/load-role-definition';
import type { RoleDefinition } from './role/role-definition';
import { runRole } from './run/run-role';
import { UsageError } from './run/usage-error';
import { setupLayer } from './setup/setup-layer';
import type { SetupResult } from './setup/setup-result';
import { loadTeamDefinition } from './team/load-team-definition';
import type { TeamDefinition } from './team/team-definition';

const USAGE: string = [
  'omd — an organizational layer over the Devin CLI',
  '',
  'Usage:',
  '  omd run <role> "<task>" [--json]   Run a role against a task end to end',
  '  omd doctor                         Check the local runtime contract',
  '  omd roles list [--json]            List the project’s roles',
  '  omd roles show <role> [--json]     Show a role’s expanded contract',
  '  omd setup [--scope=<parts>]        Install the in-session layer (parts: rules,roles,skills,hooks)',
  '  omd team run <team> "<task>"       Run a team pipeline (architect → executor → reviewer)',
  '  omd council run <c> "<question>"   Run a deliberation council [--proposal= --team= --sign --json]',
  '',
].join('\n');

function write(stream: NodeJS.WriteStream, text: string): void {
  stream.write(text.endsWith('\n') ? text : `${text}\n`);
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
    case 'run': {
      const report: RunReport = await runRole({
        roleName: command.role,
        task: command.task,
        workingDirectory: cwd,
        runner,
        clock: (): number => Date.now(),
      });
      write(
        process.stdout,
        command.json
          ? JSON.stringify(renderJsonReport(report))
          : renderHumanReport(report),
      );
      return exitCodeForOutcome(report.failureTier);
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
    case 'team-run': {
      const team: TeamDefinition = await loadTeamDefinition(cwd, command.team);
      const reader: Interface = createInterface({ input: process.stdin });
      const readLine: LineReader = (): Promise<string> =>
        new Promise<string>((resolve: (line: string) => void): void => {
          reader.once('line', (line: string): void => {
            resolve(line);
          });
        });
      try {
        const report: PipelineReport = await runPipeline({
          team,
          task: command.task,
          runStage: createProcessStageRunner(cwd),
          gate: createStdinGate(readLine, (text: string): void => {
            write(process.stdout, text);
          }),
        });
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
      const council: CouncilDeclaration = await loadCouncilDeclaration(
        cwd,
        command.council,
      );
      const team: TeamDefinition | null =
        command.team !== null
          ? await loadTeamDefinition(cwd, command.team)
          : null;
      const seatDeps: SeatSessionDeps = createProcessSeatDeps(cwd);
      const reader: Interface = createInterface({ input: process.stdin });
      const readLine: LineReader = (): Promise<string> =>
        new Promise<string>((resolve: (line: string) => void): void => {
          reader.once('line', (line: string): void => {
            resolve(line);
          });
        });
      try {
        const outcome: DeliberationOutcome = await runDeliberation({
          council,
          question: command.question,
          attachedProposal: command.proposal,
          team,
          humanSigned: command.sign,
          seatInvoker: createSeatInvoker(seatDeps),
          proposerAction: createProposerAction(seatDeps),
          claimKeyOf: normalizeClaimKey,
          launch: createPipelineLauncher({
            runStage: createProcessStageRunner(cwd),
            gate: createStdinGate(readLine, (text: string): void => {
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
        reader.close();
      }
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
    if (error instanceof UsageError) {
      write(process.stderr, `usage error: ${error.message}`);
      process.exitCode = USAGE_ERROR_EXIT_CODE;
      return;
    }
    write(
      process.stderr,
      `error: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  });
