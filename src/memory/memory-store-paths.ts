import { join } from 'node:path';
import { MEMORY_SUBTREE_SEGMENTS } from './memory-subtree-segments';
import { NOTEPAD_FILE_NAME } from './notepad-file-name';
import { PROFILE_FILE_NAME } from './profile-file-name';

export class MemoryStorePaths {
  public readonly dir: string;
  public readonly notepad: string;
  public readonly profile: string;

  public constructor(baseDir: string) {
    this.dir = join(baseDir, ...MEMORY_SUBTREE_SEGMENTS);
    this.notepad = join(this.dir, NOTEPAD_FILE_NAME);
    this.profile = join(this.dir, PROFILE_FILE_NAME);
  }
}
