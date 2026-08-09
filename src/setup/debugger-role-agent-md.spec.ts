import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { assertGenericRoleContract } from '../testing/assert-generic-role-contract';
import { bodyHeadings } from '../testing/body-headings';
import { goodExampleBlock } from '../testing/good-example-block';
import { ROLE_BODY_SECTIONS } from '../testing/role-body-sections';
import { DEBUGGER_ROLE_AGENT_MD } from './debugger-role-agent-md';
import { DEBUGGER_ROLE_SCHEMA } from './debugger-role-schema';

const ROLE: RoleDefinition = parseRoleDefinition(
  DEBUGGER_ROLE_AGENT_MD,
  'debugger',
);
const SCHEMA: object = JSON.parse(DEBUGGER_ROLE_SCHEMA) as object;

describe('DEBUGGER_ROLE_AGENT_MD', () => {
  it('parses as the debugger role definition', () => {
    expect(ROLE.name).toBe('debugger');
    expect(ROLE.outputArtifact).toBe('diagnosis.json');
  });

  it('declares the schema its artifact is validated against', () => {
    expect(ROLE.outputSchema).toBe('.devin/schemas/diagnosis.schema.json');
  });

  it('bounds the turns and isolates the context', () => {
    expect(ROLE.maxTurns).toBeGreaterThan(0);
    expect(ROLE.contextPolicy).toBe('isolated');
  });

  it('stays artifact-scoped by declaring no write scope at all', () => {
    expect(DEBUGGER_ROLE_AGENT_MD).not.toContain('omd-write-scope');
    expect(ROLE.writeScope).toBe('artifact');
  });

  it('grants command execution so its evidence can be real', () => {
    expect(ROLE.tools).toEqual(['read', 'grep', 'create', 'edit', 'exec']);
    expect(ROLE.permissions.allow).toContain('Exec(**)');
  });

  it('keeps its diagnosis the only path it may write', () => {
    const writes: readonly string[] = ROLE.permissions.allow.filter(
      (rule: string): boolean => rule.startsWith('Write('),
    );
    expect(writes).toEqual(['Write(diagnosis.json)']);
  });

  it('carries the ten role-body sections as headings in order', () => {
    expect(bodyHeadings(ROLE.promptBody)).toEqual(ROLE_BODY_SECTIONS);
  });

  it('states the mission as diagnosing, not fixing', () => {
    expect(ROLE.promptBody).toContain('diagnosis.json');
    expect(ROLE.promptBody).toContain('root cause');
  });

  it('leaves the fix to the executor', () => {
    expect(ROLE.promptBody).toContain('executor');
  });

  it('makes not isolating a reportable outcome', () => {
    expect(ROLE.promptBody).toContain('hypothes');
    expect(ROLE.promptBody).toContain('eliminated');
  });

  it('models a good example the installed schema accepts', () => {
    expect(
      validateAgainstSchema(
        JSON.parse(goodExampleBlock(ROLE.promptBody)),
        SCHEMA,
      ),
    ).toEqual([]);
  });

  it('honors the generic role contract', () => {
    assertGenericRoleContract(ROLE);
  });
});
