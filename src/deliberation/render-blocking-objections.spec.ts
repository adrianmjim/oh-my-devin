import { describe, expect, it } from 'vitest';
import { renderBlockingObjections } from './render-blocking-objections';
import type { TypedPosition } from './typed-position';

const OBJECTION: TypedPosition = {
  seat: 'security',
  lens: 'auth',
  kind: 'objection',
  domain: 'auth',
  severity: 'high',
  concern: 'token leak',
  assumptions: [],
  reconsiderWhen: [],
};

describe('renderBlockingObjections', () => {
  it('renders each objection with its severity and domain', () => {
    expect(renderBlockingObjections([OBJECTION])).toBe(
      '- [high] auth: token leak',
    );
  });

  it('states that nothing blocks when the list is empty', () => {
    expect(renderBlockingObjections([])).toBe('(none)');
  });

  it('never names the seat behind an objection', () => {
    expect(renderBlockingObjections([OBJECTION])).not.toContain('security');
  });
});
