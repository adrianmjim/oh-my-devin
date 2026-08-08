import { BENCH_MODEL } from './bench-model';
import { BENCH_MODEL_ENV } from './bench-model-env';

export function resolveBenchModel(
  env: Record<string, string | undefined>,
): string {
  const override: string = (env[BENCH_MODEL_ENV] ?? '').trim();
  return override === '' ? BENCH_MODEL : override;
}
