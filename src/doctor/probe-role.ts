import type { RoleDefinition } from '../role/role-definition';

export const PROBE_ROLE: RoleDefinition = {
  name: 'omd-doctor-probe',
  engine: 'devin',
  agentType: null,
  model: null,
  tools: [],
  permissions: { allow: [], deny: [], ask: [] },
  outputArtifact: 'probe.json',
  outputSchema: 'probe.schema.json',
  maxTurns: 1,
  contextPolicy: 'isolated',
  wallTimeMs: null,
  promptBody: 'probe',
};
