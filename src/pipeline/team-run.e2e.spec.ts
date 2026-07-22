import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import type { DevinStubScript } from '../testing/devin-stub-script';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';

interface PipelineStageFixture {
  readonly role: string;
  readonly artifact: string;
}

const STAGES: readonly PipelineStageFixture[] = [
  { role: 'architect', artifact: 'architecture.json' },
  { role: 'executor', artifact: 'evidence.json' },
  { role: 'reviewer', artifact: 'review.json' },
];

const PERMISSIVE_SCHEMA: string = JSON.stringify({ type: 'object' });

const TEAM_YAML: string = [
  'name: feature',
  'members:',
  '  - role: architect',
  '    count: 1',
  '  - role: executor',
  '    count: 1',
  '  - role: reviewer',
  '    count: 1',
  'workflow:',
  '  architect:',
  '    then: executor',
  '  executor:',
  '    then: reviewer',
  '  reviewer:',
  '    on_passed: done',
  '',
].join('\n');

const THREE_TURNS: DevinStubScript = {
  turns: [
    { stdout: 'architect done', stderr: '', exitCode: 0 },
    { stdout: 'executor done', stderr: '', exitCode: 0 },
    { stdout: 'reviewer done', stderr: '', exitCode: 0 },
  ],
  listResponse: { stdout: '[]', stderr: '', exitCode: 0 },
};

function git(cwd: string, args: readonly string[]): Promise<void> {
  return new Promise<void>(
    (resolve: () => void, reject: (error: Error) => void): void => {
      const child: ChildProcessWithoutNullStreams = spawn('git', [...args], {
        cwd,
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: 'omd',
          GIT_AUTHOR_EMAIL: 'omd@example.com',
          GIT_COMMITTER_NAME: 'omd',
          GIT_COMMITTER_EMAIL: 'omd@example.com',
        },
      });
      let stderr: string = '';
      child.stderr.on('data', (chunk: Buffer): void => {
        stderr += chunk.toString();
      });
      child.on('error', reject);
      child.on('close', (code: number | null): void => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`git ${args.join(' ')} failed: ${stderr}`));
        }
      });
    },
  );
}

async function writeIn(
  dir: string,
  relativePath: string,
  content: string,
): Promise<void> {
  const absolute: string = join(dir, relativePath);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, 'utf8');
}

async function scaffoldPipeline(project: E2eProject): Promise<void> {
  const setup: CommandResult = await project.run(['setup']);
  if (setup.exitCode !== 0) {
    throw new Error(`omd setup failed: ${setup.stderr}`);
  }
  const dir: string = project.dir;
  await writeIn(dir, '.gitignore', '.omd/\n');
  for (const stage of STAGES) {
    const agentMd: string = [
      '---',
      `omd-output: ${stage.artifact}`,
      `omd-schema: .devin/schemas/${stage.role}.schema.json`,
      'omd-max-turns: 3',
      '---',
      `You are the ${stage.role}. Produce ${stage.artifact}.`,
      '',
    ].join('\n');
    await writeIn(
      dir,
      join('.devin', 'agents', stage.role, 'AGENT.md'),
      agentMd,
    );
    await writeIn(
      dir,
      join('.devin', 'schemas', `${stage.role}.schema.json`),
      PERMISSIVE_SCHEMA,
    );
    await writeIn(dir, stage.artifact, '{}');
  }
  await writeIn(dir, join('.devin', 'teams', 'feature.yaml'), TEAM_YAML);

  await git(dir, ['init', '-q']);
  await git(dir, ['add', '-A']);
  await git(dir, ['commit', '-q', '-m', 'scaffold pipeline fixture']);
}

describe('omd team run (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('runs the three-stage pipeline to success when every gate is approved', async () => {
    const active: E2eProject = await createE2eProject();
    project = active;
    await scaffoldPipeline(active);
    await active.writeScript(THREE_TURNS);

    const result: CommandResult = await active.run(
      ['team', 'run', 'feature', 'ship the feature'],
      { stdin: ['approve', 'approve', 'approve'] },
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('omd team run — succeeded');
    expect(result.stdout).toContain('architect: ok, gate=approve');
    expect(result.stdout).toContain('reviewer: ok, gate=approve');
  });

  it('halts the pipeline with a non-zero exit when a gate is rejected', async () => {
    const active: E2eProject = await createE2eProject();
    project = active;
    await scaffoldPipeline(active);
    await active.writeScript(THREE_TURNS);

    const result: CommandResult = await active.run(
      ['team', 'run', 'feature', 'ship the feature'],
      { stdin: ['reject'] },
    );

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('omd team run — halted');
    expect(result.stdout).toContain('gate=reject');
    expect(result.stdout).toContain('halted at: architect');
  });
});
