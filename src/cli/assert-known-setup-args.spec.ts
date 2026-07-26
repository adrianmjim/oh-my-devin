import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import { assertKnownSetupArgs } from './assert-known-setup-args';

describe('assertKnownSetupArgs', () => {
  it('accepts no arguments at all', () => {
    expect(() => {
      assertKnownSetupArgs([]);
    }).not.toThrow();
  });

  it('accepts the inline level and scope flags', () => {
    expect(() => {
      assertKnownSetupArgs(['--level=user', '--scope=skills']);
    }).not.toThrow();
  });

  it('rejects a misspelled flag', () => {
    expect(() => {
      assertKnownSetupArgs(['--levl=user']);
    }).toThrow(UsageError);
  });

  it('rejects a positional argument', () => {
    expect(() => {
      assertKnownSetupArgs(['user']);
    }).toThrow(UsageError);
  });

  it('rejects the separated flag form', () => {
    expect(() => {
      assertKnownSetupArgs(['--level', 'user']);
    }).toThrow(UsageError);
  });
});
