export const CRITIC_ROLE_SCHEMA: string = `${JSON.stringify(
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
          required: ['severity', 'category', 'summary', 'fix'],
          properties: {
            severity: {
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low'],
            },
            category: {
              type: 'string',
              enum: ['present_flaw', 'missing_element'],
            },
            location: { type: 'string', minLength: 1, pattern: '\\S' },
            absentElement: { type: 'string', minLength: 1, pattern: '\\S' },
            summary: { type: 'string', minLength: 1, pattern: '\\S' },
            fix: { type: 'string', minLength: 1, pattern: '\\S' },
          },
          allOf: [
            {
              if: {
                properties: { category: { const: 'present_flaw' } },
                required: ['category'],
              },
              then: { required: ['location'] },
            },
            {
              if: {
                properties: { category: { const: 'missing_element' } },
                required: ['category'],
              },
              then: { required: ['absentElement'] },
            },
          ],
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
