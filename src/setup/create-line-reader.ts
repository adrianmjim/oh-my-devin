import { createInterface } from 'node:readline/promises';
import type { Interface } from 'node:readline/promises';
import type { LineReader } from './line-reader';
import type { LineResolver } from './line-resolver';

export function createLineReader(
  input: NodeJS.ReadableStream,
  output: NodeJS.WritableStream,
): LineReader {
  const reader: Interface = createInterface({ input });
  const buffered: string[] = [];
  const waiting: LineResolver[] = [];
  let ended: boolean = false;

  reader.on('line', (line: string): void => {
    const next: LineResolver | undefined = waiting.shift();
    if (next === undefined) {
      buffered.push(line);
    } else {
      next(line);
    }
  });

  reader.on('close', (): void => {
    ended = true;
    for (const next of waiting.splice(0)) {
      next(null);
    }
  });

  const next = (prompt: string): Promise<string | null> => {
    output.write(prompt);
    const line: string | undefined = buffered.shift();
    if (line !== undefined) {
      return Promise.resolve(line);
    }
    if (ended) {
      return Promise.resolve(null);
    }
    return new Promise<string | null>((resolve: LineResolver): void => {
      waiting.push(resolve);
    });
  };

  return {
    next,
    close: (): void => {
      reader.close();
    },
  };
}
