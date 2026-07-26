import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CLI_PATH: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'dist',
  'cli.js',
);
