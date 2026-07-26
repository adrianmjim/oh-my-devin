import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import { parseSetupLevel } from './parse-setup-level';

describe('parseSetupLevel', () => {
  it('is null when no level flag is present', () => {
    expect(parseSetupLevel(['--scope=skills'])).toBeNull();
  });

  it('parses the project level', () => {
    expect(parseSetupLevel(['--level=project'])).toBe('project');
  });

  it('parses the user level', () => {
    expect(parseSetupLevel(['--level=user'])).toBe('user');
  });

  it('rejects an unknown level', () => {
    expect(() => parseSetupLevel(['--level=global'])).toThrow(UsageError);
  });

  it('rejects an empty level', () => {
    expect(() => parseSetupLevel(['--level='])).toThrow(UsageError);
  });
});
