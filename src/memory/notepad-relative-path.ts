import { MEMORY_SUBTREE_SEGMENTS } from './memory-subtree-segments';
import { NOTEPAD_FILE_NAME } from './notepad-file-name';

export const NOTEPAD_RELATIVE_PATH: string = [
  ...MEMORY_SUBTREE_SEGMENTS,
  NOTEPAD_FILE_NAME,
].join('/');
