export const DEBUGGER_ROLE_SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['evidence'],
    properties: {
      evidence: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['source', 'observation'],
          properties: {
            source: { type: 'string', minLength: 1, pattern: '\\S' },
            observation: { type: 'string', minLength: 1, pattern: '\\S' },
          },
          additionalProperties: false,
        },
      },
      rootCause: {
        type: 'object',
        required: ['location', 'explanation', 'fixDirection'],
        properties: {
          location: { type: 'string', minLength: 1, pattern: '\\S' },
          explanation: { type: 'string', minLength: 1, pattern: '\\S' },
          fixDirection: { type: 'string', minLength: 1, pattern: '\\S' },
        },
        additionalProperties: false,
      },
      notIsolated: {
        type: 'object',
        required: ['eliminatedHypotheses'],
        properties: {
          eliminatedHypotheses: {
            type: 'array',
            minItems: 1,
            items: { type: 'string', minLength: 1, pattern: '\\S' },
          },
        },
        additionalProperties: false,
      },
    },
    oneOf: [{ required: ['rootCause'] }, { required: ['notIsolated'] }],
    additionalProperties: false,
  },
  null,
  2,
)}\n`;
