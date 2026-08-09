export const DOCUMENT_SPECIALIST_ROLE_SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['answers'],
    properties: {
      answers: {
        type: 'array',
        items: {
          type: 'object',
          required: ['question', 'answer', 'source'],
          properties: {
            question: { type: 'string', minLength: 1, pattern: '\\S' },
            answer: { type: 'string', minLength: 1, pattern: '\\S' },
            source: { type: 'string', minLength: 1, pattern: '\\S' },
          },
          additionalProperties: false,
        },
      },
      notFound: {
        type: 'object',
        required: ['sourcesConsulted'],
        properties: {
          sourcesConsulted: {
            type: 'array',
            minItems: 1,
            items: { type: 'string', minLength: 1, pattern: '\\S' },
          },
        },
        additionalProperties: false,
      },
    },
    oneOf: [
      { properties: { answers: { minItems: 1 } } },
      { required: ['notFound'] },
    ],
    additionalProperties: false,
  },
  null,
  2,
)}\n`;
