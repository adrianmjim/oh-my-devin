import { describe, expect, it } from 'vitest';
import { ArtifactStore } from './artifact-store';

describe('ArtifactStore', () => {
  it('yields an artifact it was given', () => {
    const store: ArtifactStore = new ArtifactStore();

    store.set('requirements', 'build it');

    expect(store.get('requirements')).toBe('build it');
    expect(store.has('requirements')).toBe(true);
  });

  it('is empty until something is stored', () => {
    const store: ArtifactStore = new ArtifactStore();

    expect(store.get('requirements')).toBeUndefined();
    expect(store.has('requirements')).toBe(false);
  });

  it('replaces an artifact stored again', () => {
    const store: ArtifactStore = new ArtifactStore();

    store.set('diff', 'first');
    store.set('diff', 'second');

    expect(store.get('diff')).toBe('second');
  });

  it('gives each store its own artifacts', () => {
    const store: ArtifactStore = new ArtifactStore();
    store.set('diff', 'first');

    expect(new ArtifactStore().has('diff')).toBe(false);
  });
});
