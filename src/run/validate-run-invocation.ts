import type { LayerLookup } from '../layer/layer-lookup';
import { resolveRunInvocation } from './resolve-run-invocation';
import type { RunExecutionContext } from './run-execution-context';

export async function validateRunInvocation(
  lookup: LayerLookup,
  roleName: string,
  task: string,
  context: RunExecutionContext,
): Promise<void> {
  await resolveRunInvocation(lookup, roleName, task, context);
}
