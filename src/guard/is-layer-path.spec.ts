import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isLayerPath } from './is-layer-path';

const BASE: string = resolve('/project');

describe('isLayerPath', () => {
  it('passes the layer directories and the agent instruction file', () => {
    expect(isLayerPath(BASE, join(BASE, '.omd'))).toBe(true);
    expect(isLayerPath(BASE, join(BASE, '.devin'))).toBe(true);
    expect(isLayerPath(BASE, join(BASE, 'AGENTS.md'))).toBe(true);
  });

  it('passes nested targets inside a layer directory', () => {
    expect(
      isLayerPath(BASE, join(BASE, '.omd', 'runs', 'r1', 'events.jsonl')),
    ).toBe(true);
    expect(isLayerPath(BASE, join(BASE, '.devin', 'hooks.v1.json'))).toBe(true);
  });

  it('agrees on absolute and relative spellings of the same target', () => {
    expect(isLayerPath(BASE, '.omd/modes/slots.json')).toBe(true);
    expect(isLayerPath(BASE, './.omd/modes/slots.json')).toBe(true);
    expect(isLayerPath(BASE, join(BASE, 'src', 'a.ts'))).toBe(false);
    expect(isLayerPath(BASE, 'src/a.ts')).toBe(false);
    expect(isLayerPath(BASE, join(BASE, '.omd', '..', 'src', 'a.ts'))).toBe(
      false,
    );
  });

  it('holds source, documentation, and project configuration out of scope', () => {
    expect(isLayerPath(BASE, join(BASE, 'src', 'index.ts'))).toBe(false);
    expect(isLayerPath(BASE, join(BASE, 'docs', 'guide.md'))).toBe(false);
    expect(isLayerPath(BASE, join(BASE, 'package.json'))).toBe(false);
    expect(isLayerPath(BASE, join(BASE, 'README.md'))).toBe(false);
  });

  it('holds a nested instruction file out of scope', () => {
    expect(isLayerPath(BASE, join(BASE, 'docs', 'AGENTS.md'))).toBe(false);
  });

  it('holds targets outside the project out of scope', () => {
    expect(isLayerPath(BASE, resolve('/etc/passwd'))).toBe(false);
    expect(isLayerPath(BASE, join(BASE, '..', 'other', '.omd', 'x'))).toBe(
      false,
    );
    expect(isLayerPath(BASE, BASE)).toBe(false);
  });
});
