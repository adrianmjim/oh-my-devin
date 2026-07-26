export const ARCHITECT_ROLE_SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['approach'],
    properties: {
      approach: { type: 'string' },
      steps: { type: 'array', items: { type: 'string' } },
    },
    additionalProperties: false,
  },
  null,
  2,
)}\n`;
