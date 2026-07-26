import type { LayerComponent } from '../layer/layer-component';
import { isLayerComponent } from '../layer/is-layer-component';

export function parseScopeAnswer(
  normalized: string,
): readonly LayerComponent[] | null {
  const parts: readonly string[] = normalized
    .split(',')
    .map((part: string): string => part.trim())
    .filter((part: string): boolean => part.length > 0);
  const components: LayerComponent[] = [];
  let valid: boolean = parts.length > 0;
  for (const part of parts) {
    if (isLayerComponent(part)) {
      components.push(part);
    } else {
      valid = false;
    }
  }
  return valid ? components : null;
}
