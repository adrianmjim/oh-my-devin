import { describe, expect, it } from 'vitest';
import { readEntryCommands } from './read-entry-commands';

describe('readEntryCommands', () => {
  it('reads no command without a manifest', () => {
    expect(readEntryCommands(null)).toEqual([]);
  });

  it('renders each declared script through the declared package manager', () => {
    expect(
      readEntryCommands(
        JSON.stringify({
          packageManager: 'pnpm@11.17.0',
          scripts: { build: 'tsc', test: 'vitest run' },
        }),
      ),
    ).toEqual(['pnpm run build', 'pnpm run test']);
  });

  it('falls back to npm when the manifest declares no package manager', () => {
    expect(
      readEntryCommands(JSON.stringify({ scripts: { test: 'x' } })),
    ).toEqual(['npm run test']);
  });

  it('reads no command from a manifest without scripts', () => {
    expect(readEntryCommands(JSON.stringify({ name: 'thing' }))).toEqual([]);
  });

  it('reads no command from an unparseable or unexpected manifest', () => {
    expect(readEntryCommands('not json')).toEqual([]);
    expect(readEntryCommands(JSON.stringify(['thing']))).toEqual([]);
    expect(
      readEntryCommands(JSON.stringify({ scripts: 'all of them' })),
    ).toEqual([]);
  });
});
