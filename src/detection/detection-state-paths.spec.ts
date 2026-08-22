import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MemoryStorePaths } from '../memory/memory-store-paths';
import { DetectionStatePaths } from './detection-state-paths';

describe('DetectionStatePaths', () => {
  it('holds detection state in its own transient subtree', () => {
    const paths: DetectionStatePaths = new DetectionStatePaths('/project');

    expect(paths.dir).toBe(join('/project', '.omd', 'detection'));
    expect(paths.candidates).toBe(join(paths.dir, 'candidates.json'));
    expect(paths.cursors).toBe(join(paths.dir, 'cursors.json'));
    expect(paths.rules).toBe(join(paths.dir, 'staged-rules.json'));
  });

  it('holds nothing inside the durable memory subtree', () => {
    const paths: DetectionStatePaths = new DetectionStatePaths('/project');
    const durable: string = new MemoryStorePaths('/project').dir;

    for (const path of [paths.candidates, paths.cursors, paths.rules]) {
      expect(path.startsWith(durable)).toBe(false);
    }
  });
});
