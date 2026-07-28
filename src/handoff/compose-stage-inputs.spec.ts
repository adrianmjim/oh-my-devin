import { describe, expect, it } from 'vitest';
import type { HandoffArtifactName } from './handoff-artifact-name';
import { ArtifactStore } from './artifact-store';
import { baseStageEntry } from './base-stage-entry';
import { HandoffError } from './handoff-error';
import { composeStageInputs } from './compose-stage-inputs';
import { reworkStageEntry } from './rework-stage-entry';

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
      baseStageEntry('architect'),
      fullStore(),
    );
    expect([...inputs.keys()]).toEqual(['requirements']);
  });

  it('gives the executor the requirements and the architecture', () => {
    const inputs: ReadonlyMap<HandoffArtifactName, string> = composeStageInputs(
      baseStageEntry('executor'),
      fullStore(),
    );
    expect([...inputs.keys()]).toEqual(['requirements', 'architecture.json']);
  });

  it('gives the reviewer exactly the independence set, excluding the architecture', () => {
    const inputs: ReadonlyMap<HandoffArtifactName, string> = composeStageInputs(
      baseStageEntry('reviewer'),
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

  it('gives the executor re-entered by a reviewer rejection the findings and the rejected diff', () => {
    const inputs: ReadonlyMap<HandoffArtifactName, string> = composeStageInputs(
      reworkStageEntry('executor', 'reviewer'),
      fullStore(),
    );
    expect([...inputs.keys()]).toEqual([
      'requirements',
      'architecture.json',
      'review.json',
      'diff',
    ]);
    expect(inputs.get('review.json')).toBe('REV');
    expect(inputs.get('diff')).toBe('DIFF');
  });

  it('gives an undesignated rework edge the base incoming set', () => {
    const inputs: ReadonlyMap<HandoffArtifactName, string> = composeStageInputs(
      reworkStageEntry('executor', 'architect'),
      fullStore(),
    );
    expect([...inputs.keys()]).toEqual(['requirements', 'architecture.json']);
    expect(inputs.has('review.json')).toBe(false);
  });

  it('throws when a designated input is missing from the store', () => {
    const store = new ArtifactStore();
    store.set('requirements', 'REQ');
    expect(() => composeStageInputs(baseStageEntry('executor'), store)).toThrow(
      HandoffError,
    );
  });

  it('names the stage and the artifact when a rework input is missing', () => {
    const store = new ArtifactStore();
    store.set('requirements', 'REQ');
    store.set('architecture.json', 'ARCH');
    store.set('diff', 'DIFF');
    expect(() =>
      composeStageInputs(reworkStageEntry('executor', 'reviewer'), store),
    ).toThrow(/executor.*review\.json/);
  });
});
