export const SECURITY_REVIEWER_ROLE_SCHEMA: string = `${JSON.stringify(
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
          required: ['severity', 'category', 'location', 'remediation'],
          properties: {
            severity: {
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low'],
            },
            category: { type: 'string', minLength: 1, pattern: '\\S' },
            location: { type: 'string', minLength: 1, pattern: '\\S' },
            remediation: { type: 'string', minLength: 1, pattern: '\\S' },
          },
          additionalProperties: false,
        },
      },
    },
    allOf: [
      {
        if: {
          properties: { verdict: { const: 'request_changes' } },
          required: ['verdict'],
        },
        then: { properties: { findings: { minItems: 1 } } },
      },
      {
        if: {
          properties: { verdict: { const: 'approve' } },
          required: ['verdict'],
        },
        then: {
          properties: {
            findings: {
              items: { properties: { severity: { enum: ['medium', 'low'] } } },
            },
          },
        },
      },
    ],
    additionalProperties: false,
  },
  null,
  2,
)}\n`;
