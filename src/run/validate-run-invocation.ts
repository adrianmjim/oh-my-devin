import type { LayerLookup } from '../layer/layer-lookup';
import { resolveRunInvocation } from './resolve-run-invocation';

export async function validateRunInvocation(
  lookup: LayerLookup,
  roleName: string,
  task: string,
): Promise<void> {
  await resolveRunInvocation(lookup, roleName, task);
}
