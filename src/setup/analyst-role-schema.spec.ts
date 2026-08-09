import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { ANALYST_ROLE_SCHEMA } from './analyst-role-schema';

const SCHEMA: Record<string, unknown> = JSON.parse(
  ANALYST_ROLE_SCHEMA,
) as Record<string, unknown>;
const PROPERTIES: Record<string, unknown> = (SCHEMA['properties'] ??
  {}) as Record<string, unknown>;

function itemsOf(list: string): Record<string, unknown> {
  const entry: Record<string, unknown> = (PROPERTIES[list] ?? {}) as Record<
    string,
    unknown
  >;
  return (entry['items'] ?? {}) as Record<string, unknown>;
}

const CRITERION: Record<string, string> = {
  check: 'A run with no role named exits non-zero',
  passesWhen: 'The exit code is 2 and the usage error names the missing role',
};

const MINIMAL: Record<string, unknown> = {
  acceptanceCriteria: [CRITERION],
  openQuestions: [],
  assumptions: [],
  scopeRisks: [],
};

describe('ANALYST_ROLE_SCHEMA', () => {
  it('is a draft-07 JSON schema for an object', () => {
    expect(SCHEMA['$schema']).toBe('http://json-schema.org/draft-07/schema#');
    expect(SCHEMA['type']).toBe('object');
  });

  it('requires all four lists to be accounted for', () => {
    expect(SCHEMA['required']).toEqual([
      'acceptanceCriteria',
      'openQuestions',
      'assumptions',
      'scopeRisks',
    ]);
  });

  it('demands at least one acceptance criterion', () => {
    const criteria: Record<string, unknown> = (PROPERTIES[
      'acceptanceCriteria'
    ] ?? {}) as Record<string, unknown>;
    expect(criteria['type']).toBe('array');
    expect(criteria['minItems']).toBe(1);
  });

  it('phrases every criterion as a pass/fail check', () => {
    expect(itemsOf('acceptanceCriteria')['required']).toEqual([
      'check',
      'passesWhen',
    ]);
  });

  it('makes every question earn its place', () => {
    expect(itemsOf('openQuestions')['required']).toEqual([
      'question',
      'whyItMatters',
    ]);
  });

  it('makes every assumption say how it would be validated', () => {
    expect(itemsOf('assumptions')['required']).toEqual([
      'assumption',
      'validationMethod',
    ]);
  });

  it('makes every scope risk carry its prevention', () => {
    expect(itemsOf('scopeRisks')['required']).toEqual(['risk', 'prevention']);
  });

  it('closes the object and ends with a newline', () => {
    expect(SCHEMA['additionalProperties']).toBe(false);
    expect(ANALYST_ROLE_SCHEMA.endsWith('\n')).toBe(true);
  });

  it('accepts one criterion beside three empty lists', () => {
    expect(validateAgainstSchema(MINIMAL, SCHEMA)).toEqual([]);
  });

  it('rejects an analysis that produced no acceptance criterion', () => {
    expect(
      validateAgainstSchema({ ...MINIMAL, acceptanceCriteria: [] }, SCHEMA),
    ).not.toEqual([]);
  });

  it('rejects a criterion with no observable pass condition', () => {
    expect(
      validateAgainstSchema(
        { ...MINIMAL, acceptanceCriteria: [{ check: CRITERION['check'] }] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a question that does not say why it matters', () => {
    expect(
      validateAgainstSchema(
        { ...MINIMAL, openQuestions: [{ question: 'Which store wins?' }] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects an assumption with no validation method', () => {
    expect(
      validateAgainstSchema(
        { ...MINIMAL, assumptions: [{ assumption: 'The CLI is installed' }] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a scope risk with no prevention', () => {
    expect(
      validateAgainstSchema(
        { ...MINIMAL, scopeRisks: [{ risk: 'The wave doubles in size' }] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a whitespace-only criterion', () => {
    expect(
      validateAgainstSchema(
        {
          ...MINIMAL,
          acceptanceCriteria: [{ check: '  ', passesWhen: '  ' }],
        },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('accepts a fully populated analysis', () => {
    expect(
      validateAgainstSchema(
        {
          acceptanceCriteria: [CRITERION],
          openQuestions: [
            {
              question: 'Does the bench pin survive a plan change?',
              whyItMatters: 'Every committed baseline names the model used',
            },
          ],
          assumptions: [
            {
              assumption: 'The engine exposes a fetch tool',
              validationMethod: 'Run the headless web-research spike',
            },
          ],
          scopeRisks: [
            {
              risk: 'Six fixture trees balloon the change',
              prevention: 'One flawed and one clean fixture per role to start',
            },
          ],
        },
        SCHEMA,
      ),
    ).toEqual([]);
  });
});
