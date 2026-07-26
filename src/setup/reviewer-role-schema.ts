export const REVIEWER_ROLE_SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['verdict'],
    properties: {
      verdict: { type: 'string', enum: ['approve', 'request_changes'] },
      notes: { type: 'string' },
    },
    additionalProperties: false,
  },
  null,
  2,
)}\n`;
