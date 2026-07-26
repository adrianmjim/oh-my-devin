import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { roleDefinitionRelativePath } from './role-definition-relative-path';

describe('roleDefinitionRelativePath', () => {
  it('places a role AGENT.md under the engine agents directory', () => {
    expect(roleDefinitionRelativePath('reviewer')).toBe(
      join('.devin', 'agents', 'reviewer', 'AGENT.md'),
    );
  });
});
