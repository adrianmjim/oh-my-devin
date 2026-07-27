import { describe, expect, it } from 'vitest';
import { parseRoleDefinition } from '../role/parse-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { AGENT_TOOL_VOCABULARY } from '../testing/agent-tool-vocabulary';
import { bodyHeadings } from '../testing/body-headings';
import { ENGINE_FOREIGN_TOKENS } from '../testing/engine-foreign-tokens';
import { goodExampleBlock } from '../testing/good-example-block';
import { MAX_ROLE_BODY_LINES } from '../testing/max-role-body-lines';
import { ROLE_BODY_SECTIONS } from '../testing/role-body-sections';
import { ARCHITECT_ROLE_AGENT_MD } from './architect-role-agent-md';

const ROLE: RoleDefinition = parseRoleDefinition(
  ARCHITECT_ROLE_AGENT_MD,
  'architect',
);

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

  it('models a good example the role can copy verbatim', () => {
    expect(() => {
      JSON.parse(goodExampleBlock(ROLE.promptBody));
    }).not.toThrow();
  });

  it('reaches for no engine-foreign tooling or state', () => {
    for (const token of ENGINE_FOREIGN_TOKENS) {
      expect(ROLE.promptBody, token).not.toContain(token);
    }
  });

  it('names every tool it is granted and no tool it is not', () => {
    for (const tool of ROLE.tools) {
      expect(ROLE.promptBody, tool).toContain(`\`${tool}\``);
    }
    for (const tool of AGENT_TOOL_VOCABULARY) {
      if (!ROLE.tools.includes(tool)) {
        expect(ROLE.promptBody, tool).not.toContain(`\`${tool}\``);
      }
    }
  });

  it('leaves the per-invocation contract to the run-time preamble', () => {
    expect(ROLE.promptBody).not.toContain('.devin/schemas/');
    expect(ROLE.promptBody).not.toContain('omd-max-turns');
    expect(ROLE.promptBody).not.toContain('omd-wall-time');
  });

  it('stays within the role-body length budget', () => {
    expect(ROLE.promptBody.split('\n').length).toBeLessThanOrEqual(
      MAX_ROLE_BODY_LINES,
    );
  });
});
