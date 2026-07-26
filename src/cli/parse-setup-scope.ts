import type { LayerComponent } from '../layer/layer-component';
import { isLayerComponent } from '../layer/is-layer-component';
import { UsageError } from '../run/usage-error';
import { formatLayerComponents } from '../setup/format-layer-components';
import { SCOPE_PREFIX } from './scope-prefix';

export function parseSetupScope(
  rest: readonly string[],
): readonly LayerComponent[] | null {
  const flag: string | undefined = rest.find((arg: string): boolean =>
    arg.startsWith(SCOPE_PREFIX),
  );
  if (flag === undefined) {
    return null;
  }
  const parts: readonly string[] = flag
    .slice(SCOPE_PREFIX.length)
    .split(',')
    .map((part: string): string => part.trim())
    .filter((part: string): boolean => part.length > 0);
  if (parts.length === 0) {
    throw new UsageError(
      `usage: omd setup [--scope=${formatLayerComponents(',')}]`,
    );
  }
  const components: LayerComponent[] = [];
  for (const part of parts) {
    if (!isLayerComponent(part)) {
      throw new UsageError(
        `unknown setup scope component "${part}" (expected: ${formatLayerComponents(', ')})`,
      );
    }
    components.push(part);
  }
  return components;
}
