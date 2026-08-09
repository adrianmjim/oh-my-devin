import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { deriveApprovalPosture } from '../contract/derive-approval-posture';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { arrayItemSchema } from '../testing/array-item-schema';
import { assertGenericRoleContract } from '../testing/assert-generic-role-contract';
import { bodyHeadings } from '../testing/body-headings';
import { goodExampleBlock } from '../testing/good-example-block';
import { ROLE_BODY_SECTIONS } from '../testing/role-body-sections';
import { DOCUMENT_SPECIALIST_ROLE_AGENT_MD } from './document-specialist-role-agent-md';
import { DOCUMENT_SPECIALIST_ROLE_SCHEMA } from './document-specialist-role-schema';

const ROLE: RoleDefinition = parseRoleDefinition(
  DOCUMENT_SPECIALIST_ROLE_AGENT_MD,
  'document-specialist',
);
const ANSWER_SCHEMA: object = arrayItemSchema(
  DOCUMENT_SPECIALIST_ROLE_SCHEMA,
  'answers',
);

describe('DOCUMENT_SPECIALIST_ROLE_AGENT_MD', () => {
  it('parses as the document specialist role definition', () => {
    expect(ROLE.name).toBe('document-specialist');
    expect(ROLE.outputArtifact).toBe('research-brief.json');
  });

  it('declares the schema its artifact is validated against', () => {
    expect(ROLE.outputSchema).toBe('.devin/schemas/research-brief.schema.json');
  });

  it('bounds the turns and isolates the context', () => {
    expect(ROLE.maxTurns).toBeGreaterThan(0);
    expect(ROLE.contextPolicy).toBe('isolated');
  });

  it('stays artifact-scoped by declaring no write scope at all', () => {
    expect(DOCUMENT_SPECIALIST_ROLE_AGENT_MD).not.toContain('omd-write-scope');
    expect(ROLE.writeScope).toBe('artifact');
  });

  it('grants the fetch tool its research needs', () => {
    expect(ROLE.tools).toEqual(['read', 'grep', 'create', 'edit', 'webfetch']);
  });

  it('grants no command-execution tool despite the posture rule', () => {
    expect(ROLE.tools).not.toContain('exec');
  });

  it('carries the rule that places it at the posture the fetch needs', () => {
    expect(ROLE.permissions.allow).toContain('Exec(**)');
    expect(
      deriveApprovalPosture({
        system_instructions: [],
        allowed_tools: ROLE.tools,
        permissions: ROLE.permissions,
      }),
    ).toBe('command-execution');
  });

  it('keeps its brief the only path it may write', () => {
    const writes: readonly string[] = ROLE.permissions.allow.filter(
      (rule: string): boolean => rule.startsWith('Write('),
    );
    expect(writes).toEqual(['Write(research-brief.json)']);
  });

  it('carries the ten role-body sections as headings in order', () => {
    expect(bodyHeadings(ROLE.promptBody)).toEqual(ROLE_BODY_SECTIONS);
  });

  it('states the mission as answering from named sources', () => {
    expect(ROLE.promptBody).toContain('research-brief.json');
    expect(ROLE.promptBody).toContain('source');
  });

  it('leaves this repository to the explore role', () => {
    expect(ROLE.promptBody).toContain('explore');
  });

  it('makes finding no answer a reportable outcome', () => {
    expect(ROLE.promptBody).toContain('consulted');
  });

  it('models a good example the installed schema accepts', () => {
    expect(
      validateAgainstSchema(
        JSON.parse(goodExampleBlock(ROLE.promptBody)),
        ANSWER_SCHEMA,
      ),
    ).toEqual([]);
  });

  it('honors the generic role contract', () => {
    assertGenericRoleContract(ROLE);
  });
});
