import { describe, expect, it } from 'vitest';
import type { OmdConfiguration } from './omd-configuration';
import { parseOmdConfiguration } from './parse-omd-configuration';

describe('parseOmdConfiguration', () => {
  it('reads the guard level from the snake_case mapping', () => {
    const config: OmdConfiguration = parseOmdConfiguration(
      'guard:\n  level: strict\n',
    );

    expect(config).toEqual({ guard: { level: 'strict' } });
  });

  it('ignores unknown keys beside and inside the guard mapping', () => {
    const config: OmdConfiguration = parseOmdConfiguration(
      ['telemetry: on', 'guard:', '  level: ask', '  future_key: 3', ''].join(
        '\n',
      ),
    );

    expect(config).toEqual({ guard: { level: 'ask' } });
  });

  it('resolves an unknown level as no declared level', () => {
    expect(parseOmdConfiguration('guard:\n  level: paranoid\n')).toEqual({
      guard: { level: null },
    });
  });

  it('resolves a document without a guard mapping as absent', () => {
    expect(parseOmdConfiguration('telemetry: on\n')).toEqual({ guard: null });
    expect(parseOmdConfiguration('')).toEqual({ guard: null });
  });

  it('resolves unparseable or non-mapping documents as absent', () => {
    expect(parseOmdConfiguration('guard: [1, 2\n')).toEqual({ guard: null });
    expect(parseOmdConfiguration('- a\n- b\n')).toEqual({ guard: null });
    expect(parseOmdConfiguration('guard: warn\n')).toEqual({ guard: null });
  });
});
