import { basename } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CLI_PATH } from './cli-path';

describe('CLI_PATH', () => {
  it('points at the built entrypoint', () => {
    expect(basename(CLI_PATH)).toBe('cli.js');
    expect(CLI_PATH).toContain('dist');
  });

  it('is absolute so it resolves from any working directory', () => {
    expect(CLI_PATH.startsWith('/')).toBe(true);
  });
});
