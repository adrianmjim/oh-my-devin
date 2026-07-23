import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { reportVersion } from './report-version';

describe('reportVersion', () => {
  it('yields the version declared in the package manifest', async () => {
    const raw: string = await readFile(resolve('package.json'), 'utf8');
    const manifest: Record<string, unknown> = JSON.parse(raw) as Record<
      string,
      unknown
    >;
    const declared: unknown = manifest['version'];

    expect(typeof declared).toBe('string');
    expect(await reportVersion()).toBe(declared);
  });
});
