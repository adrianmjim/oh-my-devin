import { describe, expect, it } from 'vitest';
import { isRepoRelativePath } from './is-repo-relative-path';

describe('isRepoRelativePath', () => {
  it('accepts a bare file name', () => {
    expect(isRepoRelativePath('evidence.json')).toBe(true);
  });

  it('accepts a nested relative path', () => {
    expect(isRepoRelativePath('reports/evidence.json')).toBe(true);
  });

  it('rejects an absolute path', () => {
    expect(isRepoRelativePath('/tmp/evidence.json')).toBe(false);
  });

  it('rejects a parent traversal', () => {
    expect(isRepoRelativePath('../evidence.json')).toBe(false);
  });

  it('rejects a traversal buried inside the path', () => {
    expect(isRepoRelativePath('reports/../../evidence.json')).toBe(false);
  });
});
