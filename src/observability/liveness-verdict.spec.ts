import { describe, expect, it } from 'vitest';
import { deriveLiveness } from './liveness-verdict';

describe('deriveLiveness', () => {
  const threshold: number = 120000;

  it('reads running when the stamp is fresh', () => {
    expect(deriveLiveness(100000, 150000, threshold)).toBe('running');
  });

  it('reads stalled when the stamp is older than the threshold', () => {
    expect(deriveLiveness(100000, 100000 + threshold + 1, threshold)).toBe(
      'stalled',
    );
  });

  it('reads running at exactly the threshold age', () => {
    expect(deriveLiveness(100000, 100000 + threshold, threshold)).toBe(
      'running',
    );
  });

  it('reads stalled when no stamp has ever been written', () => {
    expect(deriveLiveness(null, 150000, threshold)).toBe('stalled');
  });

  it('reads running again once the stamp resumes refreshing', () => {
    const stale: number = 100000;
    const readAt: number = 100000 + threshold + 60000;
    expect(deriveLiveness(stale, readAt, threshold)).toBe('stalled');

    const resumedStamp: number = readAt - 1000;
    expect(deriveLiveness(resumedStamp, readAt, threshold)).toBe('running');
  });
});
