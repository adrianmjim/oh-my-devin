import { resolveRunInvocation } from './resolve-run-invocation';

export async function validateRunInvocation(
  baseDir: string,
  roleName: string,
  task: string,
): Promise<void> {
  await resolveRunInvocation(baseDir, roleName, task);
}
