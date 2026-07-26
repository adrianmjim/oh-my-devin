import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import type { InstallLevel } from '../layer/install-level';
import type { LineReader } from './line-reader';
import { promptLevel } from './prompt-level';

class ScriptedReader implements LineReader {
  public readonly prompts: string[] = [];
  private index: number = 0;

  public constructor(private readonly answers: readonly (string | null)[]) {}

  public next(prompt: string): Promise<string | null> {
    this.prompts.push(prompt);
    const answer: string | null = this.answers[this.index] ?? null;
    this.index += 1;
    return Promise.resolve(answer);
  }

  public close(): void {
    this.index = this.answers.length;
  }
}

function sink(written: string[]): PassThrough {
  const output: PassThrough = new PassThrough();
  output.on('data', (chunk: Buffer): void => {
    written.push(chunk.toString());
  });
  return output;
}

describe('promptLevel', () => {
  it('accepts an explicit user level', async () => {
    const written: string[] = [];
    const level: InstallLevel = await promptLevel(
      new ScriptedReader(['user']),
      sink(written),
    );
    expect(level).toBe('user');
  });

  it('accepts an explicit project level', async () => {
    const written: string[] = [];
    const level: InstallLevel = await promptLevel(
      new ScriptedReader(['project']),
      sink(written),
    );
    expect(level).toBe('project');
  });

  it('is case-insensitive and tolerates surrounding whitespace', async () => {
    const written: string[] = [];
    const level: InstallLevel = await promptLevel(
      new ScriptedReader(['  USER  ']),
      sink(written),
    );
    expect(level).toBe('user');
  });

  it('defaults to project on an empty answer', async () => {
    const written: string[] = [];
    const level: InstallLevel = await promptLevel(
      new ScriptedReader(['']),
      sink(written),
    );
    expect(level).toBe('project');
  });

  it('defaults to project when the input ends', async () => {
    const written: string[] = [];
    const level: InstallLevel = await promptLevel(
      new ScriptedReader([null]),
      sink(written),
    );
    expect(level).toBe('project');
    expect(written.join('')).toContain('\n');
  });

  it('re-prompts with a hint after an unrecognized answer', async () => {
    const written: string[] = [];
    const reader = new ScriptedReader(['maybe', 'user']);
    const level: InstallLevel = await promptLevel(reader, sink(written));

    expect(level).toBe('user');
    expect(reader.prompts).toHaveLength(2);
    expect(written.join('')).toContain('Please answer "project" or "user".');
  });
});
