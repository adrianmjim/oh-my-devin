import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { arrayItemSchema } from '../testing/array-item-schema';
import { assertGenericRoleContract } from '../testing/assert-generic-role-contract';
import { bodyHeadings } from '../testing/body-headings';
import { goodExampleBlock } from '../testing/good-example-block';
import { ROLE_BODY_SECTIONS } from '../testing/role-body-sections';
import { ANALYST_ROLE_AGENT_MD } from './analyst-role-agent-md';
import { ANALYST_ROLE_SCHEMA } from './analyst-role-schema';

const ROLE: RoleDefinition = parseRoleDefinition(
  ANALYST_ROLE_AGENT_MD,
  'analyst',
);
const CRITERION_SCHEMA: object = arrayItemSchema(
  ANALYST_ROLE_SCHEMA,
  'acceptanceCriteria',
);

describe('ANALYST_ROLE_AGENT_MD', () => {
  it('parses as the analyst role definition', () => {
    expect(ROLE.name).toBe('analyst');
    expect(ROLE.outputArtifact).toBe('requirements-analysis.json');
  });

  it('declares the schema its artifact is validated against', () => {
    expect(ROLE.outputSchema).toBe(
      '.devin/schemas/requirements-analysis.schema.json',
    );
  });

  it('bounds the turns and isolates the context', () => {
    expect(ROLE.maxTurns).toBeGreaterThan(0);
    expect(ROLE.contextPolicy).toBe('isolated');
  });

  it('stays artifact-scoped by declaring no write scope at all', () => {
    expect(ANALYST_ROLE_AGENT_MD).not.toContain('omd-write-scope');
    expect(ROLE.writeScope).toBe('artifact');
  });

  it('grants the read-only toolset and writes only its own artifact', () => {
    expect(ROLE.tools).toEqual(['read', 'grep', 'create', 'edit']);
    expect(ROLE.permissions.allow).toEqual([
      'Write(requirements-analysis.json)',
    ]);
  });

  it('carries the ten role-body sections as headings in order', () => {
    expect(bodyHeadings(ROLE.promptBody)).toEqual(ROLE_BODY_SECTIONS);
  });

  it('states the mission as turning scope into checkable criteria', () => {
    expect(ROLE.promptBody).toContain('requirements-analysis.json');
    expect(ROLE.promptBody).toContain('acceptance criteria');
  });

  it('leaves the approach to the architect', () => {
    expect(ROLE.promptBody).toContain('architect');
    expect(ROLE.promptBody).toContain('architecture.json');
  });

  it('surfaces questions, assumptions, and scope risks', () => {
    expect(ROLE.promptBody).toContain('assumption');
    expect(ROLE.promptBody).toContain('scope');
    expect(ROLE.promptBody).toContain('question');
  });

  it('models a good example the installed schema accepts', () => {
    expect(
      validateAgainstSchema(
        JSON.parse(goodExampleBlock(ROLE.promptBody)),
        CRITERION_SCHEMA,
      ),
    ).toEqual([]);
  });

  it('honors the generic role contract', () => {
    assertGenericRoleContract(ROLE);
  });
});
