import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { createLineReader } from './create-line-reader';
import type { LineReader } from './line-reader';

function recorder(output: PassThrough, written: string[]): void {
  output.on('data', (chunk: Buffer): void => {
    written.push(chunk.toString());
  });
}

describe('createLineReader', () => {
  it('returns a line buffered before the first read', async () => {
    const input: PassThrough = new PassThrough();
    const output: PassThrough = new PassThrough();
    const written: string[] = [];
    recorder(output, written);
    input.write('user\n');

    const reader: LineReader = createLineReader(input, output);
    const line: string | null = await reader.next('level? ');
    reader.close();

    expect(line).toBe('user');
  });

  it('writes the prompt before it resolves the read', async () => {
    const input: PassThrough = new PassThrough();
    const output: PassThrough = new PassThrough();
    const written: string[] = [];
    recorder(output, written);
    input.write('user\n');

    const reader: LineReader = createLineReader(input, output);
    await reader.next('level? ');
    reader.close();

    expect(written.join('')).toBe('level? ');
  });

  it('resolves a pending read with null when the input ends', async () => {
    const input: PassThrough = new PassThrough();
    const output: PassThrough = new PassThrough();
    const written: string[] = [];
    recorder(output, written);

    const reader: LineReader = createLineReader(input, output);
    const pending: Promise<string | null> = reader.next('level? ');
    input.end();

    expect(await pending).toBeNull();
  });

  it('returns null for a read issued after the reader is closed', async () => {
    const input: PassThrough = new PassThrough();
    const output: PassThrough = new PassThrough();
    const written: string[] = [];
    recorder(output, written);

    const reader: LineReader = createLineReader(input, output);
    reader.close();
    await Promise.resolve();

    expect(await reader.next('level? ')).toBeNull();
  });

  it('returns buffered lines in order', async () => {
    const input: PassThrough = new PassThrough();
    const output: PassThrough = new PassThrough();
    const written: string[] = [];
    recorder(output, written);
    input.write('user\n');
    input.write('roles\n');

    const reader: LineReader = createLineReader(input, output);
    const first: string | null = await reader.next('level? ');
    const second: string | null = await reader.next('scope? ');
    reader.close();

    expect([first, second]).toEqual(['user', 'roles']);
  });
});
