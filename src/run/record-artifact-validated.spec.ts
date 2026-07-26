import { describe, expect, it } from 'vitest';
import type { ProgressEvent } from '../observability/progress-event';
import type { RunObserver } from '../observability/run-observer';
import type { RoleDefinition } from '../role/role-definition';
import { recordArtifactValidated } from './record-artifact-validated';

const ROLE: RoleDefinition = {
  name: 'worker',
  engine: 'devin',
  agentType: null,
  model: null,
  tools: [],
  permissions: { allow: [], deny: [], ask: [] },
  outputArtifact: 'out.json',
  outputSchema: 'out.schema.json',
  maxTurns: 5,
  contextPolicy: 'isolated',
  wallTimeMs: null,
  promptBody: 'Do the work.',
};

function observer(events: ProgressEvent[]): RunObserver {
  return {
    append: (event: ProgressEvent): Promise<void> => {
      events.push(event);
      return Promise.resolve();
    },
    close: (): void => undefined,
  };
}

describe('recordArtifactValidated', () => {
  it('records the validation verdict against the role artifact', async () => {
    const events: ProgressEvent[] = [];

    await recordArtifactValidated(observer(events), 7, ROLE, {
      valid: false,
      missing: true,
      errors: [],
    });

    expect(events).toEqual([
      {
        type: 'artifactValidated',
        timestamp: 7,
        artifactPath: 'out.json',
        valid: false,
        missing: true,
      },
    ]);
  });

  it('records nothing when the run has no recorder', async () => {
    await expect(
      recordArtifactValidated(undefined, 1, ROLE, {
        valid: true,
        missing: false,
        errors: [],
      }),
    ).resolves.toBeUndefined();
  });
});
