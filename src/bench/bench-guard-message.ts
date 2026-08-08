import { BENCH_ENV } from './bench-env';

export const BENCH_GUARD_MESSAGE: string =
  `the bench suite spends Devin quota and runs only on an explicit opt-in: ` +
  `set ${BENCH_ENV}=1 for a real run or ${BENCH_ENV}=dry for the free dry run`;
