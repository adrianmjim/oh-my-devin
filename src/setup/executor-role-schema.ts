export const EXECUTOR_ROLE_SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['tests', 'commands'],
    properties: {
      tests: { type: 'string', enum: ['passed', 'failed'] },
      commands: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['command', 'result'],
          properties: {
            command: { type: 'string', minLength: 1, pattern: '\\S' },
            result: { type: 'string', minLength: 1, pattern: '\\S' },
          },
          additionalProperties: false,
        },
      },
      notes: { type: 'string' },
    },
    additionalProperties: false,
  },
  null,
  2,
)}\n`;
