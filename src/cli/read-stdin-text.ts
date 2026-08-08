import type { Readable } from 'node:stream';

export function readStdinText(stream: Readable): Promise<string> {
  return new Promise<string>((resolve: (text: string) => void): void => {
    let raw: string = '';
    stream.setEncoding('utf8');
    stream.on('data', (chunk: string): void => {
      raw += chunk;
    });
    stream.on('end', (): void => {
      resolve(raw);
    });
    stream.on('error', (): void => {
      resolve('');
    });
  });
}
