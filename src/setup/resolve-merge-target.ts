import { layerFilePath } from '../layer/layer-file-path';
import { commentStyleForPath } from '../ownership/comment-style-for-path';
import type { LayerFile } from './layer-file';
import type { MergeTarget } from './merge-target';
import type { ResolveLayerTargetsOptions } from './resolve-layer-targets-options';

export function resolveMergeTarget(
  file: LayerFile,
  options: ResolveLayerTargetsOptions,
): MergeTarget {
  const userLevel: boolean = options.level === 'user';
  const base: string = userLevel ? options.userConfigDir : options.projectDir;
  const absolutePath: string = layerFilePath(
    options.level,
    base,
    file.relativePath,
  );
  const content: string =
    userLevel && file.userContent !== undefined
      ? file.userContent
      : file.content;
  return {
    kind: 'merge',
    component: file.component,
    absolutePath,
    reportPath: userLevel ? absolutePath : file.relativePath,
    strategy: file.strategy,
    framing: {
      id: file.regionId,
      version: options.version,
      style: commentStyleForPath(file.relativePath),
      content,
    },
  };
}
