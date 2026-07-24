import { describe, expect, it } from 'vitest';
import type { JsonDetachedLaunch } from './json-detached-launch';
import { renderDetachedLaunchJson } from './render-detached-launch-json';

describe('renderDetachedLaunchJson', () => {
  it('wraps the run identity in a bounded json shape', () => {
    const rendered: JsonDetachedLaunch = renderDetachedLaunchJson('run-7');
    expect(rendered).toEqual({ runId: 'run-7' });
  });
});
