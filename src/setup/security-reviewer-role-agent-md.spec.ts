import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { arrayItemSchema } from '../testing/array-item-schema';
import { assertGenericRoleContract } from '../testing/assert-generic-role-contract';
import { bodyHeadings } from '../testing/body-headings';
import { goodExampleBlock } from '../testing/good-example-block';
import { ROLE_BODY_SECTIONS } from '../testing/role-body-sections';
import { SECURITY_REVIEWER_ROLE_AGENT_MD } from './security-reviewer-role-agent-md';
import { SECURITY_REVIEWER_ROLE_SCHEMA } from './security-reviewer-role-schema';

const ROLE: RoleDefinition = parseRoleDefinition(
  SECURITY_REVIEWER_ROLE_AGENT_MD,
  'security-reviewer',
);
const FINDING_SCHEMA: object = arrayItemSchema(
  SECURITY_REVIEWER_ROLE_SCHEMA,
  'findings',
);

describe('SECURITY_REVIEWER_ROLE_AGENT_MD', () => {
  it('parses as the security reviewer role definition', () => {
    expect(ROLE.name).toBe('security-reviewer');
    expect(ROLE.outputArtifact).toBe('security-review.json');
  });

  it('declares the schema its artifact is validated against', () => {
    expect(ROLE.outputSchema).toBe(
      '.devin/schemas/security-review.schema.json',
    );
  });

  it('bounds the turns and isolates the context', () => {
    expect(ROLE.maxTurns).toBeGreaterThan(0);
    expect(ROLE.contextPolicy).toBe('isolated');
  });

  it('stays artifact-scoped by declaring no write scope at all', () => {
    expect(SECURITY_REVIEWER_ROLE_AGENT_MD).not.toContain('omd-write-scope');
    expect(ROLE.writeScope).toBe('artifact');
  });

  it('grants the read-only toolset and writes only its own artifact', () => {
    expect(ROLE.tools).toEqual(['read', 'grep', 'create', 'edit']);
    expect(ROLE.permissions.allow).toEqual(['Write(security-review.json)']);
  });

  it('carries the ten role-body sections as headings in order', () => {
    expect(bodyHeadings(ROLE.promptBody)).toEqual(ROLE_BODY_SECTIONS);
  });

  it('states the mission as reporting vulnerabilities', () => {
    expect(ROLE.promptBody).toContain('security-review.json');
    expect(ROLE.promptBody).toContain('vulnerabilit');
  });

  it('leaves general correctness to the reviewer', () => {
    expect(ROLE.promptBody).toContain('reviewer');
  });

  it('holds both verdicts to a stated discipline', () => {
    expect(ROLE.promptBody).toContain('`approve`');
    expect(ROLE.promptBody).toContain('`request_changes`');
  });

  it('prioritises by severity rather than by category count', () => {
    expect(ROLE.promptBody).toContain('severity');
    expect(ROLE.promptBody).toContain('exploitab');
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
