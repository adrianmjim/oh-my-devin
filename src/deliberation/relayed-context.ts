import type { AnonymizedArgument } from './anonymized-argument';
import type { RelayedClarification } from './relayed-clarification';

export interface RelayedContext {
  readonly priorArguments: readonly AnonymizedArgument[];
  readonly clarifications: readonly RelayedClarification[];
}
