import { describe, expect, it } from 'vitest';
import { PROFILE_STACK_MARKERS } from './profile-stack-markers';

describe('PROFILE_STACK_MARKERS', () => {
  it('names the stack each manifest marker stands for', () => {
    expect(PROFILE_STACK_MARKERS['package.json']).toBe('node');
    expect(PROFILE_STACK_MARKERS['tsconfig.json']).toBe('typescript');
  });

  it('marks the stack by repository content, never by engine state', () => {
    for (const marker of Object.keys(PROFILE_STACK_MARKERS)) {
      expect(marker.startsWith('.devin')).toBe(false);
      expect(marker.startsWith('.omd')).toBe(false);
    }
  });
});
