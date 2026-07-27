export const REVIEWER_ROLE_SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['verdict', 'findings'],
    properties: {
      verdict: { type: 'string', enum: ['approve', 'request_changes'] },
      findings: {
        type: 'array',
        items: {
          type: 'object',
          required: ['severity', 'location', 'summary', 'fix'],
          properties: {
            severity: {
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low'],
            },
            location: { type: 'string', minLength: 1 },
            summary: { type: 'string', minLength: 1 },
            fix: { type: 'string', minLength: 1 },
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
