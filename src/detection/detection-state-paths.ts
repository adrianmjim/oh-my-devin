import { join } from 'node:path';
import { DETECTION_SUBTREE_SEGMENTS } from './detection-subtree-segments';

export class DetectionStatePaths {
  public readonly dir: string;
  public readonly candidates: string;
  public readonly cursors: string;
  public readonly rules: string;

  public constructor(baseDir: string) {
    this.dir = join(baseDir, ...DETECTION_SUBTREE_SEGMENTS);
    this.candidates = join(this.dir, 'candidates.json');
    this.cursors = join(this.dir, 'cursors.json');
    this.rules = join(this.dir, 'staged-rules.json');
  }
}
