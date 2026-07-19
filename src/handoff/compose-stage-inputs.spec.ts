import { describe, expect, it } from 'vitest';
import type { HandoffArtifactName } from './handoff-artifact-name';
import { ArtifactStore } from './artifact-store';
import { HandoffError } from './handoff-error';
import { composeStageInputs } from './compose-stage-inputs';

function fullStore(): ArtifactStore {
  const store = new ArtifactStore();
  store.set('requirements', 'REQ');
  store.set('architecture.json', 'ARCH');
  store.set('diff', 'DIFF');
  store.set('evidence.json', 'EVID');
  store.set('review.json', 'REV');
  return store;
}

describe('composeStageInputs', () => {
  it('gives the architect only the requirements', () => {
    const inputs: ReadonlyMap<HandoffArtifactName, string> = composeStageInputs(
      'architect',
      fullStore(),
    );
    expect([...inputs.keys()]).toEqual(['requirements']);
  });

  it('gives the executor the requirements and the architecture', () => {
    const inputs: ReadonlyMap<HandoffArtifactName, string> = composeStageInputs(
      'executor',
      fullStore(),
    );
    expect([...inputs.keys()]).toEqual(['requirements', 'architecture.json']);
  });

  it('gives the reviewer exactly the independence set, excluding the architecture', () => {
    const inputs: ReadonlyMap<HandoffArtifactName, string> = composeStageInputs(
      'reviewer',
      fullStore(),
    );
    expect([...inputs.keys()]).toEqual([
      'requirements',
      'diff',
      'evidence.json',
    ]);
    expect(inputs.has('architecture.json')).toBe(false);
    expect(inputs.has('review.json')).toBe(false);
  });

  it('throws when a designated input is missing from the store', () => {
    const store = new ArtifactStore();
    store.set('requirements', 'REQ');
    expect(() => composeStageInputs('executor', store)).toThrow(HandoffError);
  });
});
