export const ARCHITECT_ROLE_SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['approach', 'steps'],
    properties: {
      approach: { type: 'string', minLength: 1, pattern: '\\S' },
      steps: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['description'],
          properties: {
            description: { type: 'string', minLength: 1, pattern: '\\S' },
            files: { type: 'array', items: { type: 'string' } },
          },
          additionalProperties: false,
        },
      },
      risks: { type: 'array', items: { type: 'string' } },
    },
    additionalProperties: false,
  },
  null,
  2,
)}\n`;
