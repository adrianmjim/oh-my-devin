import { describe, expect, it } from 'vitest';
import type { RoleDefinition } from '../role/role-definition';
import { assertGenericRoleContract } from './assert-generic-role-contract';
import { MAX_ROLE_BODY_LINES } from './max-role-body-lines';

const BASE: RoleDefinition = {
  name: 'sample',
  engine: 'devin',
  agentType: null,
  model: null,
  tools: ['read', 'grep'],
  permissions: { allow: ['Write(review.json)'], deny: [], ask: [] },
  outputArtifact: 'review.json',
  outputSchema: '.devin/schemas/review.schema.json',
  maxTurns: 10,
  contextPolicy: 'isolated',
  wallTimeMs: null,
  promptBody: 'Study the diff with `read` and `grep`.',
};

describe('assertGenericRoleContract', () => {
  it('accepts a body that honors the contract', () => {
    expect(() => {
      assertGenericRoleContract(BASE);
    }).not.toThrow();
  });

  it('rejects a body reaching for engine-foreign tooling', () => {
    const role: RoleDefinition = {
      ...BASE,
      promptBody: 'Study the diff with `read` and `grep`, then TodoWrite.',
    };
    expect(() => {
      assertGenericRoleContract(role);
    }).toThrow();
  });

  it('rejects a body that never names a granted tool', () => {
    const role: RoleDefinition = {
      ...BASE,
      promptBody: 'Study the diff with `read`.',
    };
    expect(() => {
      assertGenericRoleContract(role);
    }).toThrow();
  });

  it('rejects a body naming a tool the role is not granted', () => {
    const role: RoleDefinition = {
      ...BASE,
      promptBody: 'Study the diff with `read`, `grep`, and `bash`.',
    };
    expect(() => {
      assertGenericRoleContract(role);
    }).toThrow();
  });

  it('rejects a body restating the per-invocation contract', () => {
    for (const token of ['.devin/schemas/', 'omd-max-turns', 'omd-wall-time']) {
      const role: RoleDefinition = {
        ...BASE,
        promptBody: `Study the diff with \`read\` and \`grep\`. See ${token}.`,
      };
      expect(() => {
        assertGenericRoleContract(role);
      }, token).toThrow();
    }
  });

  it('rejects a body over the length budget', () => {
    const filler: readonly string[] = Array.from(
      { length: MAX_ROLE_BODY_LINES },
      (): string => 'More.',
    );
    const role: RoleDefinition = {
      ...BASE,
      promptBody: ['Study the diff with `read` and `grep`.', ...filler].join(
        '\n',
      ),
    };
    expect(() => {
      assertGenericRoleContract(role);
    }).toThrow();
  });
});
