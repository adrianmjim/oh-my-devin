import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SMOKE_SCRATCH_DIR: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'smoke-scratch',
);
