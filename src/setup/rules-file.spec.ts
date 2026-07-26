import { describe, expect, it } from 'vitest';
import { RULES_BODY } from './rules-body';
import { RULES_FILE } from './rules-file';

describe('RULES_FILE', () => {
  it('opens with the layer heading', () => {
    expect(RULES_FILE.startsWith('# Oh My Devin — in-session layer')).toBe(
      true,
    );
  });

  it('frames the layer as covering this project', () => {
    expect(RULES_FILE).toContain('This project runs under');
  });

  it('carries the shared rules body', () => {
    expect(RULES_FILE).toContain(RULES_BODY.join('\n'));
  });
});
