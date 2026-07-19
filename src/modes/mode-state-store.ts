import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ModeState } from '../setup/mode-state';

export class ModeStateStore {
  private readonly stateDirectory: string;
  private readonly stateFile: string;

  public constructor(baseDirectory: string) {
    this.stateDirectory = join(baseDirectory, '.omd');
    this.stateFile = join(this.stateDirectory, 'mode.json');
  }

  public async set(state: ModeState): Promise<void> {
    await mkdir(this.stateDirectory, { recursive: true });
    await writeFile(this.stateFile, `${JSON.stringify(state, null, 2)}\n`);
  }

  public async clear(): Promise<void> {
    await rm(this.stateFile, { force: true });
  }
}
