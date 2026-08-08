import { Readable } from 'node:stream';
import { describe, expect, it } from 'vitest';
import { readStdinText } from './read-stdin-text';

describe('readStdinText', () => {
  it('reads the whole piped document', async () => {
    expect(
      await readStdinText(Readable.from(['{"session_id":', '"s1"}'])),
    ).toBe('{"session_id":"s1"}');
  });

  it('reads an empty string from an empty pipe', async () => {
    expect(await readStdinText(Readable.from([]))).toBe('');
  });

  it('reads an empty string when the pipe errors', async () => {
    const stream: Readable = new Readable({
      read(): void {
        this.destroy(new Error('broken pipe'));
      },
    });

    expect(await readStdinText(stream)).toBe('');
  });
});
