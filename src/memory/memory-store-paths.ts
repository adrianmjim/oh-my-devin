import { join } from 'node:path';
import { KNOWLEDGE_FILE_NAME } from './knowledge-file-name';
import { MEMORY_SUBTREE_SEGMENTS } from './memory-subtree-segments';
import { NOTEPAD_FILE_NAME } from './notepad-file-name';
import { PROFILE_FILE_NAME } from './profile-file-name';
import { RULES_FILE_NAME } from './rules-file-name';

export class MemoryStorePaths {
  public readonly dir: string;
  public readonly notepad: string;
  public readonly profile: string;
  public readonly knowledge: string;
  public readonly rules: string;

  public constructor(baseDir: string) {
    this.dir = join(baseDir, ...MEMORY_SUBTREE_SEGMENTS);
    this.notepad = join(this.dir, NOTEPAD_FILE_NAME);
    this.profile = join(this.dir, PROFILE_FILE_NAME);
    this.knowledge = join(this.dir, KNOWLEDGE_FILE_NAME);
    this.rules = join(this.dir, RULES_FILE_NAME);
  }
}
