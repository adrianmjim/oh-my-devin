import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LayerLookup } from '../layer/layer-lookup';
import { appendNotepadEntry } from '../memory/append-notepad-entry';
import { createMemoryComposer } from '../memory/create-memory-composer';
import { resolveRunInvocation } from './resolve-run-invocation';
import type { ResolvedRunInvocation } from './resolved-run-invocation';
import { UsageError } from './usage-error';

const SCHEMA = { type: 'object' };

function agentMd(schemaRef: string): string {
  return [
    '---',
    'omd-output: review.json',
    `omd-schema: ${schemaRef}`,
    'omd-max-turns: 8',
    '---',
    'You are the reviewer.',
  ].join('\n');
}

function rememberingAgentMd(): string {
  return [
    '---',
    'omd-output: review.json',
    'omd-schema: review.schema.json',
    'omd-max-turns: 8',
    'omd-memory:',
    '  - notepad',
    '---',
    'You are the reviewer.',
  ].join('\n');
}

function constructorAgentMd(): string {
  return [
    '---',
    'omd-output: evidence.json',
    'omd-schema: evidence.schema.json',
    'omd-max-turns: 12',
    'omd-write-scope: worktree',
    '---',
    'You are the executor.',
  ].join('\n');
}

describe('resolveRunInvocation', () => {
  let projectDir: string;
  let userConfigDir: string;
  let lookup: LayerLookup;

  async function scaffoldConstructor(): Promise<void> {
    const roleDir: string = join(projectDir, '.devin', 'agents', 'executor');
    await mkdir(roleDir, { recursive: true });
    await writeFile(join(roleDir, 'AGENT.md'), constructorAgentMd(), 'utf8');
    await writeFile(
      join(projectDir, 'evidence.schema.json'),
      JSON.stringify(SCHEMA),
    );
  }

  async function scaffold(): Promise<void> {
    const roleDir: string = join(projectDir, '.devin', 'agents', 'reviewer');
    await mkdir(roleDir, { recursive: true });
    await writeFile(
      join(roleDir, 'AGENT.md'),
      agentMd('review.schema.json'),
      'utf8',
    );
    await writeFile(
      join(projectDir, 'review.schema.json'),
      JSON.stringify(SCHEMA),
    );
  }

  async function scaffoldUserLevel(): Promise<void> {
    const roleDir: string = join(userConfigDir, 'agents', 'reviewer');
    await mkdir(roleDir, { recursive: true });
    await writeFile(
      join(roleDir, 'AGENT.md'),
      agentMd(join('.devin', 'schemas', 'review.schema.json')),
      'utf8',
    );
    await mkdir(join(userConfigDir, 'schemas'), { recursive: true });
    await writeFile(
      join(userConfigDir, 'schemas', 'review.schema.json'),
      JSON.stringify(SCHEMA),
    );
  }

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-resolve-'));
    userConfigDir = await mkdtemp(join(tmpdir(), 'omd-resolve-user-'));
    lookup = { projectDir, userConfigDir };
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
    await rm(userConfigDir, { recursive: true, force: true });
  });

  it('returns the resolved role, schema text and compiled bundle', async () => {
    await scaffold();
    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      lookup,
      'reviewer',
      'assess the diff',
      { workingDirectory: projectDir, provisionedWorktree: false },
    );
    expect(resolved.role.name).toBe('reviewer');
    expect(JSON.parse(resolved.schemaText)).toEqual(SCHEMA);
    expect(resolved.bundle).toBeDefined();
  });

  it('publishes the project-level schema path it resolved', async () => {
    await scaffold();
    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      lookup,
      'reviewer',
      'assess the diff',
      { workingDirectory: projectDir, provisionedWorktree: false },
    );
    expect(resolved.schemaPath).toBe(join(projectDir, 'review.schema.json'));
  });

  it('resolves a role installed only at user level, with its user-level schema', async () => {
    await scaffoldUserLevel();

    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      lookup,
      'reviewer',
      'assess the diff',
      { workingDirectory: projectDir, provisionedWorktree: false },
    );

    expect(resolved.role.name).toBe('reviewer');
    expect(resolved.schemaPath).toBe(
      join(userConfigDir, 'schemas', 'review.schema.json'),
    );
    expect(JSON.parse(resolved.schemaText)).toEqual(SCHEMA);
  });

  it('rejects an empty task as a usage error', async () => {
    await scaffold();
    await expect(
      resolveRunInvocation(lookup, 'reviewer', '   ', {
        workingDirectory: projectDir,
        provisionedWorktree: false,
      }),
    ).rejects.toThrow(UsageError);
  });

  it('rejects an unresolvable role as a usage error', async () => {
    await scaffold();
    await expect(
      resolveRunInvocation(lookup, 'ghost', 'assess the diff', {
        workingDirectory: projectDir,
        provisionedWorktree: false,
      }),
    ).rejects.toThrow(UsageError);
  });

  it('rejects a worktree-scoped role outside a provisioned worktree', async () => {
    await scaffoldConstructor();
    await expect(
      resolveRunInvocation(lookup, 'executor', 'implement the plan', {
        workingDirectory: projectDir,
        provisionedWorktree: false,
      }),
    ).rejects.toThrow(UsageError);
    await expect(
      resolveRunInvocation(lookup, 'executor', 'implement the plan', {
        workingDirectory: projectDir,
        provisionedWorktree: false,
      }),
    ).rejects.toThrow(/executor/);
  });

  it('resolves a worktree-scoped role inside a provisioned worktree', async () => {
    await scaffoldConstructor();

    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      lookup,
      'executor',
      'implement the plan',
      { workingDirectory: projectDir, provisionedWorktree: true },
    );

    expect(resolved.role.writeScope).toBe('worktree');
    expect(resolved.bundle.permissions.allow).toContain(
      `Write(${projectDir}/**)`,
    );
  });

  it('rejects a role whose declared schema file is missing', async () => {
    await scaffold();
    await rm(join(projectDir, 'review.schema.json'), { force: true });
    await expect(
      resolveRunInvocation(lookup, 'reviewer', 'assess the diff', {
        workingDirectory: projectDir,
        provisionedWorktree: false,
      }),
    ).rejects.toThrow(UsageError);
  });

  it('composes no memory into the bundle of a role that declares none', async () => {
    await scaffold();
    await appendNotepadEntry(projectDir, 'manual', 'the gate is manual', 5);

    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      lookup,
      'reviewer',
      'assess the diff',
      { workingDirectory: projectDir, provisionedWorktree: false },
    );

    expect(JSON.stringify(resolved.bundle)).not.toContain('the gate is manual');
    expect(JSON.stringify(resolved.bundle)).not.toContain('Project memory');
  });

  it('composes the declared class into the preamble of a declaring role', async () => {
    await scaffold();
    await writeFile(
      join(projectDir, '.devin', 'agents', 'reviewer', 'AGENT.md'),
      rememberingAgentMd(),
      'utf8',
    );
    await appendNotepadEntry(projectDir, 'manual', 'the gate is manual', 5);

    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      lookup,
      'reviewer',
      'assess the diff',
      { workingDirectory: projectDir, provisionedWorktree: false },
    );

    expect(resolved.bundle.system_instructions[0]).toContain(
      'the gate is manual',
    );
  });

  it('composes memory through the provided composer, not from the worktree', async () => {
    await scaffold();
    await writeFile(
      join(projectDir, '.devin', 'agents', 'reviewer', 'AGENT.md'),
      rememberingAgentMd(),
      'utf8',
    );
    await appendNotepadEntry(projectDir, 'manual', 'the gate is manual', 5);
    const worktreeDir: string = join(projectDir, '.omd', 'worktrees', 'seat-a');
    await mkdir(worktreeDir, { recursive: true });

    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      lookup,
      'reviewer',
      'assess the diff',
      {
        workingDirectory: worktreeDir,
        provisionedWorktree: true,
        composeMemory: createMemoryComposer(projectDir, 5),
      },
    );

    expect(resolved.bundle.system_instructions[0]).toContain(
      'the gate is manual',
    );
  });

  it('composes nothing that originates in another role instance’s session', async () => {
    await scaffold();
    await writeFile(
      join(projectDir, '.devin', 'agents', 'reviewer', 'AGENT.md'),
      rememberingAgentMd(),
      'utf8',
    );
    await appendNotepadEntry(projectDir, 'manual', 'the gate is manual', 5);
    const otherRunDir: string = join(projectDir, '.omd', 'runs', 'run-other');
    await mkdir(otherRunDir, { recursive: true });
    await writeFile(
      join(otherRunDir, 'events.jsonl'),
      JSON.stringify({ type: 'turnCompleted', secret: 'other-session-leak' }),
      'utf8',
    );
    await writeFile(
      join(otherRunDir, 'stdout.log'),
      'other-session-leak',
      'utf8',
    );

    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      lookup,
      'reviewer',
      'assess the diff',
      { workingDirectory: projectDir, provisionedWorktree: false },
    );

    expect(JSON.stringify(resolved.bundle)).not.toContain('other-session-leak');
    expect(JSON.stringify(resolved.bundle)).not.toContain('run-other');
  });
});
