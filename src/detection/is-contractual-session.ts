import { RUN_ID_ENV } from '../observability/run-id-env';

export function isContractualSession(env: NodeJS.ProcessEnv): boolean {
  return (env[RUN_ID_ENV] ?? '').trim() !== '';
}
