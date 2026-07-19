import type { AnonymizedArgument } from './anonymized-argument';

export type EvidenceSummarizer = (
  args: readonly AnonymizedArgument[],
) => Promise<string | null>;
