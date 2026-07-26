import { Readable, Writable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import type { ElicitedSetupOptions } from './elicited-setup-options';
import { elicitSetupOptions } from './elicit-setup-options';
import { ALL_LAYER_COMPONENTS } from '../layer/all-layer-components';

function input(text: string): Readable {
  return Readable.from([text]);
}

interface Capture {
  readonly output: Writable;
  text(): string;
}

function capture(): Capture {
  let buffer: string = '';
  const output: Writable = new Writable({
    write(chunk: Buffer, _encoding: BufferEncoding, done: () => void): void {
      buffer += chunk.toString();
      done();
    },
  });
  return { output, text: (): string => buffer };
}

function occurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe('elicitSetupOptions', () => {
  it('prompts level then scope and returns the answers', async () => {
    const sink: Capture = capture();
    const result: ElicitedSetupOptions = await elicitSetupOptions({
      input: input('user\nskills,hooks\n'),
      output: sink.output,
      interactive: true,
      level: null,
      scope: null,
    });

    expect(result.level).toBe('user');
    expect(result.scope).toEqual(['skills', 'hooks']);
    const prompts: string = sink.text();
    expect(prompts).toContain('project');
    expect(prompts).toContain('user');
    expect(prompts).toContain('full');
    for (const component of ALL_LAYER_COMPONENTS) {
      expect(prompts).toContain(component);
    }
  });

  it('accepts every default on empty answers, reproducing the flagless install', async () => {
    const sink: Capture = capture();
    const result: ElicitedSetupOptions = await elicitSetupOptions({
      input: input('\n\n'),
      output: sink.output,
      interactive: true,
      level: null,
      scope: null,
    });

    expect(result.level).toBe('project');
    expect(result.scope).toBeNull();
  });

  it('accepts defaults at end of input without hanging', async () => {
    const sink: Capture = capture();
    const result: ElicitedSetupOptions = await elicitSetupOptions({
      input: input(''),
      output: sink.output,
      interactive: true,
      level: null,
      scope: null,
    });

    expect(result.level).toBe('project');
    expect(result.scope).toBeNull();
    expect(sink.text().endsWith('\n')).toBe(true);
  });

  it('re-asks on an unrecognized answer', async () => {
    const sink: Capture = capture();
    const result: ElicitedSetupOptions = await elicitSetupOptions({
      input: input('sideways\nuser\nfull\n'),
      output: sink.output,
      interactive: true,
      level: null,
      scope: null,
    });

    expect(result.level).toBe('user');
    expect(result.scope).toBeNull();
    expect(occurrences(sink.text(), '[project/user]')).toBeGreaterThanOrEqual(
      2,
    );
  });

  it('re-asks on an unrecognized scope component', async () => {
    const sink: Capture = capture();
    const result: ElicitedSetupOptions = await elicitSetupOptions({
      input: input('project\nbogus,skills\nskills\n'),
      output: sink.output,
      interactive: true,
      level: null,
      scope: null,
    });

    expect(result.scope).toEqual(['skills']);
    expect(sink.text()).toContain('Please answer "full"');
    expect(occurrences(sink.text(), '[full')).toBeGreaterThanOrEqual(2);
    const text: string = sink.text();
    const hintStart: number = text.indexOf('Please answer "full"');
    const hint: string = text.slice(hintStart, text.indexOf('\n', hintStart));
    expect(hintStart).toBeGreaterThanOrEqual(0);
    for (const component of ALL_LAYER_COMPONENTS) {
      expect(hint).toContain(component);
    }
  });

  it('issues no prompt when both options are fixed even in an interactive terminal', async () => {
    const sink: Capture = capture();
    const result: ElicitedSetupOptions = await elicitSetupOptions({
      input: input('ignored\n'),
      output: sink.output,
      interactive: true,
      level: 'user',
      scope: ['hooks'],
    });

    expect(result.level).toBe('user');
    expect(result.scope).toEqual(['hooks']);
    expect(sink.text()).toBe('');
  });

  it('does not prompt for an option fixed on the command line', async () => {
    const sink: Capture = capture();
    const result: ElicitedSetupOptions = await elicitSetupOptions({
      input: input('skills\n'),
      output: sink.output,
      interactive: true,
      level: 'user',
      scope: null,
    });

    expect(result.level).toBe('user');
    expect(result.scope).toEqual(['skills']);
    expect(sink.text()).not.toContain('[project/user]');
  });

  it('never reads or prompts when not interactive', async () => {
    const sink: Capture = capture();
    const result: ElicitedSetupOptions = await elicitSetupOptions({
      input: input('user\nhooks\n'),
      output: sink.output,
      interactive: false,
      level: null,
      scope: null,
    });

    expect(result.level).toBe('project');
    expect(result.scope).toBeNull();
    expect(sink.text()).toBe('');
  });

  it('honors fixed flags headlessly without prompting', async () => {
    const sink: Capture = capture();
    const result: ElicitedSetupOptions = await elicitSetupOptions({
      input: input(''),
      output: sink.output,
      interactive: false,
      level: 'user',
      scope: ['hooks'],
    });

    expect(result.level).toBe('user');
    expect(result.scope).toEqual(['hooks']);
    expect(sink.text()).toBe('');
  });
});
