import { describe, expect, it } from 'vitest';
import { digestContent } from './digest-content';
import { frameUnit } from './frame-unit';
import type { RegionFraming } from './region-framing';

const SKILL: RegionFraming = {
  id: 'skill-plan',
  version: '1.2.3',
  style: 'markdown',
  content: '---\nname: plan\n---\n\nPlan the work.\n',
};

const SCRIPT: RegionFraming = {
  id: 'hook-script',
  version: '1.2.3',
  style: 'script',
  content: "#!/usr/bin/env node\nimport { readFileSync } from 'node:fs';\n",
};

describe('frameUnit', () => {
  it('places the begin sentinel after the frontmatter', () => {
    const lines: readonly string[] = frameUnit(SKILL).split('\n');

    expect(lines[0]).toBe('---');
    expect(lines[1]).toBe('name: plan');
    expect(lines[2]).toBe('---');
    expect(lines[3]?.startsWith('<!-- omd:begin ')).toBe(true);
  });

  it('places the begin sentinel after the shebang', () => {
    const lines: readonly string[] = frameUnit(SCRIPT).split('\n');

    expect(lines[0]).toBe('#!/usr/bin/env node');
    expect(lines[1]?.startsWith('// omd:begin ')).toBe(true);
  });

  it('digests the frontmatter along with the body', () => {
    expect(frameUnit(SKILL)).toContain(
      `digest=${digestContent('---\nname: plan\n---\n\nPlan the work.')}`,
    );
  });

  it('closes with the end sentinel', () => {
    expect(frameUnit(SKILL).endsWith('<!-- omd:end id=skill-plan -->\n')).toBe(
      true,
    );
    expect(frameUnit(SCRIPT).endsWith('// omd:end id=hook-script\n')).toBe(
      true,
    );
  });

  it('keeps every line of the content it framed', () => {
    const framed: string = frameUnit(SKILL);

    for (const line of ['---', 'name: plan', 'Plan the work.']) {
      expect(framed).toContain(line);
    }
  });
});
