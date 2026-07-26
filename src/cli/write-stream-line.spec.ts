import { describe, expect, it, vi } from 'vitest';
import { writeStreamLine } from './write-stream-line';

function fakeStream(): { stream: NodeJS.WriteStream; written: string[] } {
  const written: string[] = [];
  const stream = {
    write: (text: string): boolean => {
      written.push(text);
      return true;
    },
  } as unknown as NodeJS.WriteStream;
  return { stream, written };
}

describe('writeStreamLine', () => {
  it('terminates a bare line with a newline', () => {
    const { stream, written } = fakeStream();

    writeStreamLine(stream, 'done');

    expect(written).toEqual(['done\n']);
  });

  it('leaves an already terminated line untouched', () => {
    const { stream, written } = fakeStream();

    writeStreamLine(stream, 'done\n');

    expect(written).toEqual(['done\n']);
  });

  it('writes a multi-line block as one write', () => {
    const { stream, written } = fakeStream();

    writeStreamLine(stream, 'first\nsecond');

    expect(written).toEqual(['first\nsecond\n']);
  });

  it('writes to the stream it is given', () => {
    const write = vi.fn().mockReturnValue(true);

    writeStreamLine({ write } as unknown as NodeJS.WriteStream, 'x');

    expect(write).toHaveBeenCalledTimes(1);
  });
});
