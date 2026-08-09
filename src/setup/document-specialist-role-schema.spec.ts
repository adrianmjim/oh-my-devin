import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { DOCUMENT_SPECIALIST_ROLE_SCHEMA } from './document-specialist-role-schema';

const SCHEMA: Record<string, unknown> = JSON.parse(
  DOCUMENT_SPECIALIST_ROLE_SCHEMA,
) as Record<string, unknown>;
const PROPERTIES: Record<string, unknown> = (SCHEMA['properties'] ??
  {}) as Record<string, unknown>;
const ANSWERS: Record<string, unknown> = (PROPERTIES['answers'] ??
  {}) as Record<string, unknown>;
const ANSWER: Record<string, unknown> = (ANSWERS['items'] ?? {}) as Record<
  string,
  unknown
>;
const NOT_FOUND: Record<string, unknown> = (PROPERTIES['notFound'] ??
  {}) as Record<string, unknown>;

const SOURCED: Record<string, unknown> = {
  answers: [
    {
      question: 'What permission mode admits the fetch tool?',
      answer: 'Only dangerous auto-approves it in non-interactive mode',
      source: 'https://nodejs.org/api/path.html',
    },
  ],
};

const UNANSWERED: Record<string, unknown> = {
  answers: [],
  notFound: {
    sourcesConsulted: [
      'https://docs.devin.ai/cli/permissions',
      'the devin --help output',
    ],
  },
};

describe('DOCUMENT_SPECIALIST_ROLE_SCHEMA', () => {
  it('is a draft-07 JSON schema for an object', () => {
    expect(SCHEMA['$schema']).toBe('http://json-schema.org/draft-07/schema#');
    expect(SCHEMA['type']).toBe('object');
  });

  it('requires the answers list to be accounted for', () => {
    expect(SCHEMA['required']).toEqual(['answers']);
    expect(ANSWERS['type']).toBe('array');
  });

  it('makes every answer name the source it was read from', () => {
    expect(ANSWER['required']).toEqual(['question', 'answer', 'source']);
  });

  it('makes an empty-handed brief name what it consulted', () => {
    const consulted: Record<string, unknown> = (
      (NOT_FOUND['properties'] ?? {}) as Record<string, unknown>
    )['sourcesConsulted'] as Record<string, unknown>;
    expect(NOT_FOUND['required']).toEqual(['sourcesConsulted']);
    expect(consulted['minItems']).toBe(1);
  });

  it('demands exactly one of answering or saying it could not', () => {
    expect(SCHEMA['oneOf']).toEqual([
      { properties: { answers: { minItems: 1 } } },
      { required: ['notFound'] },
    ]);
  });

  it('closes both objects and ends with a newline', () => {
    expect(SCHEMA['additionalProperties']).toBe(false);
    expect(ANSWER['additionalProperties']).toBe(false);
    expect(DOCUMENT_SPECIALIST_ROLE_SCHEMA.endsWith('\n')).toBe(true);
  });

  it('accepts a sourced answer', () => {
    expect(validateAgainstSchema(SOURCED, SCHEMA)).toEqual([]);
  });

  it('accepts an honest not-found brief', () => {
    expect(validateAgainstSchema(UNANSWERED, SCHEMA)).toEqual([]);
  });

  it('rejects an unsourced answer', () => {
    expect(
      validateAgainstSchema(
        {
          answers: [{ question: 'Which mode?', answer: 'dangerous' }],
        },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects an answer whose source is only whitespace', () => {
    expect(
      validateAgainstSchema(
        {
          answers: [
            { question: 'Which mode?', answer: 'dangerous', source: '   ' },
          ],
        },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a brief that neither answered nor admitted anything', () => {
    expect(validateAgainstSchema({ answers: [] }, SCHEMA)).not.toEqual([]);
  });

  it('rejects a brief that both answers and claims it could not', () => {
    expect(
      validateAgainstSchema(
        { ...SOURCED, notFound: { sourcesConsulted: ['everything'] } },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a not-found claim that consulted nothing', () => {
    expect(
      validateAgainstSchema(
        { answers: [], notFound: { sourcesConsulted: [] } },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });
});
