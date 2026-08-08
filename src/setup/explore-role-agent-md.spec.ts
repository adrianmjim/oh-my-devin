import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { arrayItemSchema } from '../testing/array-item-schema';
import { assertGenericRoleContract } from '../testing/assert-generic-role-contract';
import { bodyHeadings } from '../testing/body-headings';
import { goodExampleBlock } from '../testing/good-example-block';
import { ROLE_BODY_SECTIONS } from '../testing/role-body-sections';
import { EXPLORE_ROLE_AGENT_MD } from './explore-role-agent-md';
import { EXPLORE_ROLE_SCHEMA } from './explore-role-schema';

const ROLE: RoleDefinition = parseRoleDefinition(
  EXPLORE_ROLE_AGENT_MD,
  'explore',
);
const FINDING_SCHEMA: object = arrayItemSchema(EXPLORE_ROLE_SCHEMA, 'findings');

describe('EXPLORE_ROLE_AGENT_MD', () => {
  it('parses as the explore role definition', () => {
    expect(ROLE.name).toBe('explore');
    expect(ROLE.outputArtifact).toBe('findings-map.json');
  });

  it('declares the schema its artifact is validated against', () => {
    expect(ROLE.outputSchema).toBe('.devin/schemas/findings-map.schema.json');
  });

  it('bounds the turns and isolates the context', () => {
    expect(ROLE.maxTurns).toBeGreaterThan(0);
    expect(ROLE.contextPolicy).toBe('isolated');
  });

  it('stays artifact-scoped by declaring no write scope at all', () => {
    expect(EXPLORE_ROLE_AGENT_MD).not.toContain('omd-write-scope');
    expect(ROLE.writeScope).toBe('artifact');
  });

  it('grants the read-only toolset and writes only its own artifact', () => {
    expect(ROLE.tools).toEqual(['read', 'grep', 'create', 'edit']);
    expect(ROLE.permissions.allow).toEqual(['Write(findings-map.json)']);
  });

  it('carries the ten role-body sections as headings in order', () => {
    expect(bodyHeadings(ROLE.promptBody)).toEqual(ROLE_BODY_SECTIONS);
  });

  it('states the mission as mapping the codebase for a caller', () => {
    expect(ROLE.promptBody).toContain('findings-map.json');
    expect(ROLE.promptBody).toContain('relationship');
  });

  it('defers architectural judgment to the architect', () => {
    expect(ROLE.promptBody).toContain('architect');
  });

  it('defers external documentation to the document specialist', () => {
    expect(ROLE.promptBody).toContain('document specialist');
  });

  it('makes finding nothing a reportable outcome', () => {
    expect(ROLE.promptBody).toContain('searched');
  });

  it('models a good example the installed schema accepts', () => {
    expect(
      validateAgainstSchema(
        JSON.parse(goodExampleBlock(ROLE.promptBody)),
        FINDING_SCHEMA,
      ),
    ).toEqual([]);
  });

  it('honors the generic role contract', () => {
    assertGenericRoleContract(ROLE);
  });
});
