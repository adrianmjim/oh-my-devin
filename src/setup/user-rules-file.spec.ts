import { describe, expect, it } from 'vitest';
import { RULES_BODY } from './rules-body';
import { USER_RULES_FILE } from './user-rules-file';

describe('USER_RULES_FILE', () => {
  it('opens with the layer heading', () => {
    expect(USER_RULES_FILE.startsWith('# Oh My Devin — in-session layer')).toBe(
      true,
    );
  });

  it('frames the layer as covering every session of the user', () => {
    expect(USER_RULES_FILE).toContain(
      'Every Devin session started by this user',
    );
  });

  it('carries the shared rules body', () => {
    expect(USER_RULES_FILE).toContain(RULES_BODY.join('\n'));
  });
});
