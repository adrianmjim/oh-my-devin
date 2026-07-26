export const EXECUTOR_ROLE_SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['tests'],
    properties: {
      tests: { type: 'string', enum: ['passed', 'failed'] },
      notes: { type: 'string' },
    },
    additionalProperties: false,
  },
  null,
  2,
)}\n`;
