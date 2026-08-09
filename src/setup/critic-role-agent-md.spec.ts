import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { arrayItemSchema } from '../testing/array-item-schema';
import { assertGenericRoleContract } from '../testing/assert-generic-role-contract';
import { bodyHeadings } from '../testing/body-headings';
import { goodExampleBlock } from '../testing/good-example-block';
import { ROLE_BODY_SECTIONS } from '../testing/role-body-sections';
import { CRITIC_ROLE_AGENT_MD } from './critic-role-agent-md';
import { CRITIC_ROLE_SCHEMA } from './critic-role-schema';

const ROLE: RoleDefinition = parseRoleDefinition(
  CRITIC_ROLE_AGENT_MD,
  'critic',
);
const FINDING_SCHEMA: object = arrayItemSchema(CRITIC_ROLE_SCHEMA, 'findings');

describe('CRITIC_ROLE_AGENT_MD', () => {
  it('parses as the critic role definition', () => {
    expect(ROLE.name).toBe('critic');
    expect(ROLE.outputArtifact).toBe('critique.json');
  });

  it('declares the schema its artifact is validated against', () => {
    expect(ROLE.outputSchema).toBe('.devin/schemas/critique.schema.json');
  });

  it('bounds the turns and isolates the context', () => {
    expect(ROLE.maxTurns).toBeGreaterThan(0);
    expect(ROLE.contextPolicy).toBe('isolated');
  });

  it('stays artifact-scoped by declaring no write scope at all', () => {
    expect(CRITIC_ROLE_AGENT_MD).not.toContain('omd-write-scope');
    expect(ROLE.writeScope).toBe('artifact');
  });

  it('grants the read-only toolset and writes only its own artifact', () => {
    expect(ROLE.tools).toEqual(['read', 'grep', 'create', 'edit']);
    expect(ROLE.permissions.allow).toEqual(['Write(critique.json)']);
  });

  it('carries the ten role-body sections as headings in order', () => {
    expect(bodyHeadings(ROLE.promptBody)).toEqual(ROLE_BODY_SECTIONS);
  });

  it('states the mission as judging a plan or work product', () => {
    expect(ROLE.promptBody).toContain('critique.json');
    expect(ROLE.promptBody).toContain('plan');
  });

  it('leaves the pipeline diff to the reviewer', () => {
    expect(ROLE.promptBody).toContain('reviewer');
    expect(ROLE.promptBody).toContain('diff');
  });

  it('holds both verdicts to a stated discipline', () => {
    expect(ROLE.promptBody).toContain('`approve`');
    expect(ROLE.promptBody).toContain('`request_changes`');
  });

  it('asks for what is missing, not only for what is wrong', () => {
    expect(ROLE.promptBody).toContain('missing');
    expect(ROLE.promptBody).toContain('`missing_element`');
    expect(ROLE.promptBody).toContain('`present_flaw`');
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
