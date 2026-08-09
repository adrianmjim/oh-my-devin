export const ANALYST_ROLE_SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: [
      'acceptanceCriteria',
      'openQuestions',
      'assumptions',
      'scopeRisks',
    ],
    properties: {
      acceptanceCriteria: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['check', 'passesWhen'],
          properties: {
            check: { type: 'string', minLength: 1, pattern: '\\S' },
            passesWhen: { type: 'string', minLength: 1, pattern: '\\S' },
          },
          additionalProperties: false,
        },
      },
      openQuestions: {
        type: 'array',
        items: {
          type: 'object',
          required: ['question', 'whyItMatters'],
          properties: {
            question: { type: 'string', minLength: 1, pattern: '\\S' },
            whyItMatters: { type: 'string', minLength: 1, pattern: '\\S' },
          },
          additionalProperties: false,
        },
      },
      assumptions: {
        type: 'array',
        items: {
          type: 'object',
          required: ['assumption', 'validationMethod'],
          properties: {
            assumption: { type: 'string', minLength: 1, pattern: '\\S' },
            validationMethod: { type: 'string', minLength: 1, pattern: '\\S' },
          },
          additionalProperties: false,
        },
      },
      scopeRisks: {
        type: 'array',
        items: {
          type: 'object',
          required: ['risk', 'prevention'],
          properties: {
            risk: { type: 'string', minLength: 1, pattern: '\\S' },
            prevention: { type: 'string', minLength: 1, pattern: '\\S' },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  null,
  2,
)}\n`;
