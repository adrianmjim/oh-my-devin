import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import type { CommandResult } from '../engine/command-result';
import { createE2eProject } from '../testing/create-e2e-project';
import type { DevinStubScript } from '../testing/devin-stub-script';
import type { E2eProject } from '../testing/e2e-project';
import { MemoryStorePaths } from './memory-store-paths';

const PERMISSIVE_SCHEMA: string = JSON.stringify({ type: 'object' });

const REMEMBERED: string = 'deploys need the staging gate';

const COUNCIL_YAML: string = [
  'name: memory-council',
  'seats:',
  '  - role: reviewer',
  '    lens: overall',
  '    proposer: true',
  '  - role: reviewer',
  '    lens: risk',
  '  - role: reviewer',
  '    lens: cost',
  'deliberation:',
  '  rounds_cap: 1',
  'authority:',
  '  on_consent: human',
  '',
].join('\n');

function turn(stdout: string): CommandResult {
  return { stdout, stderr: '', exitCode: 0 };
}

function script(turns: number): DevinStubScript {
  return {
    turns: Array.from({ length: turns }, (): CommandResult => turn('done')),
    listResponse: turn('[]'),
  };
}

function reviewerAgentMd(declaresMemory: boolean): string {
  return [
    '---',
    'omd-output: review.json',
    'omd-schema: .devin/schemas/review.schema.json',
    'omd-max-turns: 3',
    ...(declaresMemory ? ['omd-memory:', '  - notepad'] : []),
    '---',
    'You are the reviewer.',
    '',
  ].join('\n');
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

function git(cwd: string, args: readonly string[]): Promise<void> {
  return new Promise<void>(
    (resolvePromise: () => void, reject: (error: Error) => void): void => {
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
      child.on('error', reject);
      child.on('close', (code: number | null): void => {
        if (code === 0) {
          resolvePromise();
        } else {
          reject(new Error(`git ${args.join(' ')} failed`));
        }
      });
    },
  );
}

const SEAT_POSITION: string = JSON.stringify({
  kind: 'preference',
  severity: 'low',
  domain: 'delivery',
  concern: 'none blocking',
});

const SEAT_CLARIFICATION: string = JSON.stringify({
  kind: 'clarification',
  questions: [],
});

const COUNCIL_SCRIPT: DevinStubScript = {
  turns: Array.from({ length: 24 }, (): CommandResult => turn('done')),
  listResponse: turn('[]'),
  artifactWrites: [
    { path: 'review.json', content: SEAT_CLARIFICATION },
    { path: 'review.json', content: SEAT_CLARIFICATION },
    { path: 'review.json', content: SEAT_POSITION },
  ],
};

async function scaffoldReviewer(
  project: E2eProject,
  declaresMemory: boolean,
): Promise<void> {
  await project.run(['setup']);
  await writeIn(
    project.dir,
    join('.devin', 'agents', 'reviewer', 'AGENT.md'),
    reviewerAgentMd(declaresMemory),
  );
  await writeIn(
    project.dir,
    join('.devin', 'schemas', 'review.schema.json'),
    PERMISSIVE_SCHEMA,
  );
  await writeIn(project.dir, 'review.json', '{}');
}

function memorySection(bundle: AgentConfigBundle): string {
  const preamble: string = bundle.system_instructions[0] ?? '';
  const marker: number = preamble.indexOf('Project memory');
  return marker === -1 ? '' : preamble.slice(marker);
}

describe('omd memory delivery (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('delivers a remembered note to a role that declares the notepad', async () => {
    project = await createE2eProject();
    await scaffoldReviewer(project, true);
    await project.writeScript(script(1));

    await project.run(['memory', 'remember', REMEMBERED]);
    const result: CommandResult = await project.run([
      'run',
      'reviewer',
      'assess the diff',
    ]);

    expect(result.exitCode).toBe(0);
    const bundles: readonly AgentConfigBundle[] =
      await project.readHandedBundles();
    expect(bundles).toHaveLength(1);
    expect(bundles[0]?.system_instructions[0]).toContain(REMEMBERED);
  });

  it('delivers nothing to a role that declares no memory', async () => {
    project = await createE2eProject();
    await scaffoldReviewer(project, false);
    await project.writeScript(script(1));

    await project.run(['memory', 'remember', REMEMBERED]);
    const result: CommandResult = await project.run([
      'run',
      'reviewer',
      'assess the diff',
    ]);

    expect(result.exitCode).toBe(0);
    const bundles: readonly AgentConfigBundle[] =
      await project.readHandedBundles();
    expect(bundles).toHaveLength(1);
    expect(JSON.stringify(bundles[0])).not.toContain(REMEMBERED);
    expect(JSON.stringify(bundles[0])).not.toContain('Project memory');
  });

  it('leaves the store untouched by a role session that completes normally', async () => {
    project = await createE2eProject();
    await scaffoldReviewer(project, true);
    await project.writeScript(script(1));
    await project.run(['memory', 'remember', REMEMBERED]);
    const notepadPath: string = new MemoryStorePaths(project.dir).notepad;
    const before: string = await readFile(notepadPath, 'utf8');

    const result: CommandResult = await project.run([
      'run',
      'reviewer',
      'assess the diff',
    ]);

    expect(result.exitCode).toBe(0);
    expect(await readFile(notepadPath, 'utf8')).toBe(before);
  });

  it('refuses to remember over a corrupted store and preserves it', async () => {
    project = await createE2eProject();
    const paths: MemoryStorePaths = new MemoryStorePaths(project.dir);
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.notepad, 'not json at all', 'utf8');

    const result: CommandResult = await project.run([
      'memory',
      'remember',
      REMEMBERED,
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('refusing');
    expect(await readFile(paths.notepad, 'utf8')).toBe('not json at all');
  });

  it('hands every council seat byte-identical memory content', async () => {
    project = await createE2eProject();
    await scaffoldReviewer(project, true);
    await writeIn(project.dir, '.gitignore', '.omd/\n');
    await writeIn(project.dir, 'proposal.txt', 'Adopt the proposal.');
    await writeIn(
      project.dir,
      join('.devin', 'councils', 'memory-council.yaml'),
      COUNCIL_YAML,
    );
    await writeIn(project.dir, 'review.json', SEAT_POSITION);
    await git(project.dir, ['init', '-q']);
    await git(project.dir, ['add', '-A']);
    await git(project.dir, ['commit', '-q', '-m', 'scaffold memory council']);
    await project.writeScript(COUNCIL_SCRIPT);
    await project.run(['memory', 'remember', REMEMBERED]);

    const council: CommandResult = await project.run([
      'council',
      'run',
      'memory-council',
      'should we ship?',
      '--proposal',
      'proposal.txt',
      '--json',
    ]);
    expect(council.exitCode, council.stdout + council.stderr).toBe(0);

    const bundles: readonly AgentConfigBundle[] =
      await project.readHandedBundles();
    expect(bundles.length).toBeGreaterThanOrEqual(3);
    const sections: readonly string[] = bundles.map(memorySection);
    expect(sections.every((section: string): boolean => section !== '')).toBe(
      true,
    );
    expect(new Set(sections).size).toBe(1);
    expect(sections[0]).toContain(REMEMBERED);
  });
});
