import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import type { LayerComponent } from './layer-component';
import type { LineReader } from './line-reader';
import { promptScope } from './prompt-scope';

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

describe('promptScope', () => {
  it('returns null for the full install on an empty answer', async () => {
    const written: string[] = [];
    const scope: readonly LayerComponent[] | null = await promptScope(
      new ScriptedReader(['']),
      sink(written),
    );
    expect(scope).toBeNull();
  });

  it('returns null for the full install on the word full', async () => {
    const written: string[] = [];
    const scope: readonly LayerComponent[] | null = await promptScope(
      new ScriptedReader(['full']),
      sink(written),
    );
    expect(scope).toBeNull();
  });

  it('returns null when the input ends', async () => {
    const written: string[] = [];
    const scope: readonly LayerComponent[] | null = await promptScope(
      new ScriptedReader([null]),
      sink(written),
    );
    expect(scope).toBeNull();
    expect(written.join('')).toContain('\n');
  });

  it('parses a comma-separated subset', async () => {
    const written: string[] = [];
    const scope: readonly LayerComponent[] | null = await promptScope(
      new ScriptedReader(['roles,skills']),
      sink(written),
    );
    expect(scope).toEqual(['roles', 'skills']);
  });

  it('re-prompts with a hint after an unparseable answer', async () => {
    const written: string[] = [];
    const reader = new ScriptedReader(['ghosts', 'roles']);
    const scope: readonly LayerComponent[] | null = await promptScope(
      reader,
      sink(written),
    );

    expect(scope).toEqual(['roles']);
    expect(reader.prompts).toHaveLength(2);
    expect(written.join('')).toContain('Please answer "full"');
  });
});
