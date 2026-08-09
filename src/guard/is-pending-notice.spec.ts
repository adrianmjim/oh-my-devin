import { describe, expect, it } from 'vitest';
import { isPendingNotice } from './is-pending-notice';

describe('isPendingNotice', () => {
  it('accepts a notice naming its tool, target, and moment', () => {
    expect(
      isPendingNotice({
        tool: 'edit',
        filePath: 'src/index.ts',
        noticedAt: 12,
      }),
    ).toBe(true);
  });

  it('rejects a notice missing or mistyping a field', () => {
    expect(isPendingNotice({ tool: 'edit', filePath: 'src/index.ts' })).toBe(
      false,
    );
    expect(isPendingNotice({ tool: 'edit', filePath: 7, noticedAt: 12 })).toBe(
      false,
    );
    expect(
      isPendingNotice({ tool: 'edit', filePath: 'a', noticedAt: '12' }),
    ).toBe(false);
  });

  it('rejects values that are not notices', () => {
    expect(isPendingNotice(null)).toBe(false);
    expect(isPendingNotice([])).toBe(false);
    expect(isPendingNotice('notice')).toBe(false);
  });
});
