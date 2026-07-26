import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import { parseSetupScope } from './parse-setup-scope';

describe('parseSetupScope', () => {
  it('is null when no scope flag is present', () => {
    expect(parseSetupScope(['--level=user'])).toBeNull();
  });

  it('parses a comma-separated component list', () => {
    expect(parseSetupScope(['--scope=skills,hooks'])).toEqual([
      'skills',
      'hooks',
    ]);
  });

  it('trims the components and drops empty entries', () => {
    expect(parseSetupScope(['--scope=skills, hooks,'])).toEqual([
      'skills',
      'hooks',
    ]);
  });

  it('rejects an empty scope', () => {
    expect(() => parseSetupScope(['--scope='])).toThrow(UsageError);
  });

  it('rejects an unknown component', () => {
    expect(() => parseSetupScope(['--scope=bogus'])).toThrow(UsageError);
  });
});
