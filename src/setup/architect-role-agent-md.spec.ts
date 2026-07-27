import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { arrayItemSchema } from '../testing/array-item-schema';
import { assertGenericRoleContract } from '../testing/assert-generic-role-contract';
import { bodyHeadings } from '../testing/body-headings';
import { goodExampleBlock } from '../testing/good-example-block';
import { ROLE_BODY_SECTIONS } from '../testing/role-body-sections';
import { ARCHITECT_ROLE_AGENT_MD } from './architect-role-agent-md';
import { ARCHITECT_ROLE_SCHEMA } from './architect-role-schema';

const ROLE: RoleDefinition = parseRoleDefinition(
  ARCHITECT_ROLE_AGENT_MD,
  'architect',
);
const STEP_SCHEMA: object = arrayItemSchema(ARCHITECT_ROLE_SCHEMA, 'steps');

describe('ARCHITECT_ROLE_AGENT_MD', () => {
  it('parses as the architect role definition', () => {
    expect(ROLE.name).toBe('architect');
    expect(ROLE.outputArtifact).toBe('architecture.json');
  });

  it('declares the schema its artifact is validated against', () => {
    expect(ROLE.outputSchema).toBe('.devin/schemas/architecture.schema.json');
  });

  it('bounds the turns and isolates the context', () => {
    expect(ROLE.maxTurns).toBeGreaterThan(0);
    expect(ROLE.contextPolicy).toBe('isolated');
  });

  it('grants the plan-only toolset and writes only its own artifact', () => {
    expect(ROLE.tools).toEqual(['read', 'grep', 'create', 'edit']);
    expect(ROLE.permissions.allow).toEqual(['Write(architecture.json)']);
  });

  it('carries the ten role-body sections as headings in order', () => {
    expect(bodyHeadings(ROLE.promptBody)).toEqual(ROLE_BODY_SECTIONS);
  });

  it('states the mission as the handoff the executor builds against', () => {
    expect(ROLE.promptBody).toContain('architecture.json');
    expect(ROLE.promptBody).toContain('executor');
  });

  it('hands the roles it does not own their own artifacts', () => {
    expect(ROLE.promptBody).toContain('evidence.json');
    expect(ROLE.promptBody).toContain('review.json');
  });

  it('models a good example the installed schema accepts', () => {
    expect(
      validateAgainstSchema(
        JSON.parse(goodExampleBlock(ROLE.promptBody)),
        STEP_SCHEMA,
      ),
    ).toEqual([]);
  });

  it('honors the generic role contract', () => {
    assertGenericRoleContract(ROLE);
  });
});
