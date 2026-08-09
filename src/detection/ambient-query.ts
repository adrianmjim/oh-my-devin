import type { InjectionPhase } from './injection-phase';

export interface AmbientQuery {
  readonly sessionId: string | null;
  readonly prompt: string;
  readonly phase: InjectionPhase;
}
