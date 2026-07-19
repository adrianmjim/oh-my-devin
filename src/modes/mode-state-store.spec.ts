import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ModeState } from '../setup/mode-state';
import { ModeStateStore } from './mode-state-store';

describe('ModeStateStore', () => {
  let base: string = '';

  beforeEach(async (): Promise<void> => {
    base = await mkdtemp(join(tmpdir(), 'omd-mode-state-'));
  });

  afterEach(async (): Promise<void> => {
    await rm(base, { recursive: true, force: true });
  });

  it('writes the state as parseable JSON at <base>/.omd/mode.json, creating the directory', async () => {
    const state: ModeState = {
      mode: 'team',
      context: 'team mode active.',
      verification: ['pipeline terminal outcome reported'],
    };
    const store: ModeStateStore = new ModeStateStore(base);
    await store.set(state);
    const raw: string = await readFile(join(base, '.omd', 'mode.json'), 'utf8');
    expect(JSON.parse(raw)).toEqual({
      mode: 'team',
      context: 'team mode active.',
      verification: ['pipeline terminal outcome reported'],
    });
  });

  it('removes the state file on clear', async () => {
    const state: ModeState = {
      mode: 'plan',
      context: 'plan mode active.',
      verification: ['plan artifact produced'],
    };
    const store: ModeStateStore = new ModeStateStore(base);
    await store.set(state);
    await store.clear();
    await expect(stat(join(base, '.omd', 'mode.json'))).rejects.toThrow();
  });

  it('succeeds silently when clearing a missing state file', async () => {
    const store: ModeStateStore = new ModeStateStore(base);
    await expect(store.clear()).resolves.toBeUndefined();
  });
});
