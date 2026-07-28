import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { arrayItemSchema } from '../testing/array-item-schema';
import { assertGenericRoleContract } from '../testing/assert-generic-role-contract';
import { bodyHeadings } from '../testing/body-headings';
import { goodExampleBlock } from '../testing/good-example-block';
import { ROLE_BODY_SECTIONS } from '../testing/role-body-sections';
import { REVIEWER_ROLE_AGENT_MD } from './reviewer-role-agent-md';
import { REVIEWER_ROLE_SCHEMA } from './reviewer-role-schema';

const ROLE: RoleDefinition = parseRoleDefinition(
  REVIEWER_ROLE_AGENT_MD,
  'reviewer',
);
const FINDING_SCHEMA: object = arrayItemSchema(
  REVIEWER_ROLE_SCHEMA,
  'findings',
);

describe('REVIEWER_ROLE_AGENT_MD', () => {
  it('parses as the reviewer role definition', () => {
    expect(ROLE.name).toBe('reviewer');
    expect(ROLE.outputArtifact).toBe('review.json');
  });

  it('declares the schema its artifact is validated against', () => {
    expect(ROLE.outputSchema).toBe('.devin/schemas/review.schema.json');
  });

  it('bounds the turns and isolates the context', () => {
    expect(ROLE.maxTurns).toBeGreaterThan(0);
    expect(ROLE.contextPolicy).toBe('isolated');
  });

  it('stays artifact-scoped by declaring no write scope at all', () => {
    expect(REVIEWER_ROLE_AGENT_MD).not.toContain('omd-write-scope');
    expect(ROLE.writeScope).toBe('artifact');
  });

  it('grants the read-only toolset and writes only its own artifact', () => {
    expect(ROLE.tools).toEqual(['read', 'grep', 'create', 'edit']);
    expect(ROLE.permissions.allow).toEqual(['Write(review.json)']);
  });

  it('carries the ten role-body sections as headings in order', () => {
    expect(bodyHeadings(ROLE.promptBody)).toEqual(ROLE_BODY_SECTIONS);
  });

  it('states the mission as judging the diff into a verdict', () => {
    expect(ROLE.promptBody).toContain('diff');
    expect(ROLE.promptBody).toContain('review.json');
  });

  it('names the artifacts whose ownership bounds it', () => {
    expect(ROLE.promptBody).toContain('architecture.json');
    expect(ROLE.promptBody).toContain('evidence.json');
  });

  it('leaves fixing to the executor and designing to the architect', () => {
    expect(ROLE.promptBody).toContain('executor');
    expect(ROLE.promptBody).toContain('architect');
  });

  it('holds both verdicts to a stated discipline', () => {
    expect(ROLE.promptBody).toContain('`approve`');
    expect(ROLE.promptBody).toContain('`request_changes`');
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
