import type { GuardConfiguration } from './guard-configuration';

export interface OmdConfiguration {
  readonly guard: GuardConfiguration | null;
}
