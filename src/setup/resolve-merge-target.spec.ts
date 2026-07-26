import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { LayerFile } from './layer-file';
import type { MergeTarget } from './merge-target';
import { resolveMergeTarget } from './resolve-merge-target';
import type { ResolveLayerTargetsOptions } from './resolve-layer-targets-options';

const FILE: LayerFile = {
  relativePath: join('.devin', 'rules.md'),
  content: 'project body',
  userContent: 'user body',
  component: 'rules',
  strategy: 'container',
  regionId: 'rules',
};

function options(level: 'project' | 'user'): ResolveLayerTargetsOptions {
  return {
    projectDir: join('/tmp', 'omd-project'),
    userConfigDir: join('/home', 'someone', '.config', 'devin'),
    level,
    scope: ['rules'],
    version: '1.2.3',
  };
}

describe('resolveMergeTarget', () => {
  it('reports a project target by its project-relative path', () => {
    const target: MergeTarget = resolveMergeTarget(FILE, options('project'));

    expect(target.kind).toBe('merge');
    expect(target.reportPath).toBe(FILE.relativePath);
    expect(target.absolutePath).toContain('omd-project');
  });

  it('reports a user target by its absolute path', () => {
    const target: MergeTarget = resolveMergeTarget(FILE, options('user'));

    expect(target.reportPath).toBe(target.absolutePath);
  });

  it('prefers the user content at user level', () => {
    expect(resolveMergeTarget(FILE, options('user')).framing.content).toBe(
      'user body',
    );
    expect(resolveMergeTarget(FILE, options('project')).framing.content).toBe(
      'project body',
    );
  });

  it('frames the region with the installed version and the file comment style', () => {
    const target: MergeTarget = resolveMergeTarget(FILE, options('project'));

    expect(target.framing.id).toBe('rules');
    expect(target.framing.version).toBe('1.2.3');
    expect(target.framing.style).toBe('markdown');
  });

  it('carries the merge strategy of the layer file', () => {
    expect(resolveMergeTarget(FILE, options('project')).strategy).toBe(
      'container',
    );
  });
});
