import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import type { DevinStubScript } from '../testing/devin-stub-script';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';

interface StageFixture {
  readonly role: string;
  readonly artifact: string;
}

interface CouncilJson {
  readonly closure: string;
  readonly proposalSource: string;
  readonly bridgeLaunched: boolean;
  readonly exitCode: number;
}

const STAGES: readonly StageFixture[] = [
  { role: 'architect', artifact: 'architecture.json' },
  { role: 'executor', artifact: 'evidence.json' },
  { role: 'reviewer', artifact: 'review.json' },
];

const PERMISSIVE_SCHEMA: string = JSON.stringify({ type: 'object' });

const TEAM_YAML: string = [
  'name: ship',
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

const COUNCIL_YAML: string = [
  'name: design-council',
  'seats:',
  '  - role: reviewer',
  '    lens: overall',
  '    proposer: true',
  'deliberation:',
  '  rounds_cap: 1',
  'authority:',
  '  on_consent: human',
  '',
].join('\n');

const PROPOSAL_TEXT: string = 'Adopt the proposed architecture.';

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

async function scaffoldCouncil(project: E2eProject): Promise<void> {
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
      `You are the ${stage.role}.`,
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
  await writeIn(dir, join('.devin', 'teams', 'ship.yaml'), TEAM_YAML);
  await writeIn(
    dir,
    join('.devin', 'councils', 'design-council.yaml'),
    COUNCIL_YAML,
  );
  await writeIn(dir, 'proposal.txt', PROPOSAL_TEXT);

  await git(dir, ['init', '-q']);
  await git(dir, ['add', '-A']);
  await git(dir, ['commit', '-q', '-m', 'scaffold council fixture']);
}

function lastJsonLine(stdout: string): CouncilJson {
  const jsonLines: readonly string[] = stdout
    .split('\n')
    .map((line: string): string => line.trim())
    .filter((line: string): boolean => line.startsWith('{'));
  const last: string | undefined = jsonLines[jsonLines.length - 1];
  if (last === undefined) {
    throw new Error(`no JSON object found in stdout: ${stdout}`);
  }
  return JSON.parse(last) as CouncilJson;
}

const QUESTION: string = 'Should we adopt the proposed architecture?';

describe('omd council run (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('completes an attached-proposal council to consensus under --json', async () => {
    const active: E2eProject = await createE2eProject();
    project = active;
    await scaffoldCouncil(active);

    const result: CommandResult = await active.run([
      'council',
      'run',
      'design-council',
      QUESTION,
      '--proposal',
      'proposal.txt',
      '--json',
    ]);

    expect(result.exitCode).toBe(0);
    const outcome: CouncilJson = lastJsonLine(result.stdout);
    expect(outcome.closure).toBe('passed');
    expect(outcome.proposalSource).toBe('attached');
    expect(outcome.bridgeLaunched).toBe(false);
    expect(outcome.exitCode).toBe(0);
  });

  it('renders the human-readable outcome for an attached proposal', async () => {
    const active: E2eProject = await createE2eProject();
    project = active;
    await scaffoldCouncil(active);

    const result: CommandResult = await active.run([
      'council',
      'run',
      'design-council',
      QUESTION,
      '--proposal',
      'proposal.txt',
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('omd council run — passed');
    expect(result.stdout).toContain('team pipeline launched: false');
  });

  it('does not bridge to the team pipeline without --sign', async () => {
    const active: E2eProject = await createE2eProject();
    project = active;
    await scaffoldCouncil(active);

    const result: CommandResult = await active.run([
      'council',
      'run',
      'design-council',
      QUESTION,
      '--proposal',
      'proposal.txt',
      '--then',
      'ship',
      '--json',
    ]);

    expect(result.exitCode).toBe(0);
    const outcome: CouncilJson = lastJsonLine(result.stdout);
    expect(outcome.closure).toBe('passed');
    expect(outcome.bridgeLaunched).toBe(false);
  });

  it('bridges to the team pipeline when --then is signed off with --sign', async () => {
    const active: E2eProject = await createE2eProject();
    project = active;
    await scaffoldCouncil(active);
    await active.writeScript(THREE_TURNS);

    const result: CommandResult = await active.run(
      [
        'council',
        'run',
        'design-council',
        QUESTION,
        '--proposal',
        'proposal.txt',
        '--then',
        'ship',
        '--sign',
        '--json',
      ],
      { stdin: ['approve', 'approve', 'approve'] },
    );

    expect(result.exitCode).toBe(0);
    const outcome: CouncilJson = lastJsonLine(result.stdout);
    expect(outcome.closure).toBe('passed');
    expect(outcome.bridgeLaunched).toBe(true);
  });
});
