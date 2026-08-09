export const EXPLORE_ROLE_SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['findings'],
    properties: {
      findings: {
        type: 'array',
        items: {
          type: 'object',
          required: ['path', 'relevance'],
          properties: {
            path: { type: 'string', minLength: 1, pattern: '\\S' },
            relevance: { type: 'string', minLength: 1, pattern: '\\S' },
          },
          additionalProperties: false,
        },
      },
      relationships: {
        type: 'array',
        items: {
          type: 'object',
          required: ['from', 'to', 'relationship'],
          properties: {
            from: { type: 'string', minLength: 1, pattern: '\\S' },
            to: { type: 'string', minLength: 1, pattern: '\\S' },
            relationship: { type: 'string', minLength: 1, pattern: '\\S' },
          },
          additionalProperties: false,
        },
      },
      nothingFound: {
        type: 'object',
        required: ['searched'],
        properties: {
          searched: {
            type: 'array',
            minItems: 1,
            items: { type: 'string', minLength: 1, pattern: '\\S' },
          },
        },
        additionalProperties: false,
      },
    },
    oneOf: [
      { properties: { findings: { minItems: 1 } } },
      { required: ['nothingFound'] },
    ],
    additionalProperties: false,
  },
  null,
  2,
)}\n`;
