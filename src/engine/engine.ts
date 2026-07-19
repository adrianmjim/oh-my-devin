import type { EngineKind } from '../role/engine-kind';
import type { CommandInvocation } from './command-invocation';
import type { PromptTurn } from './prompt-turn';
import type { SessionListing } from './session-listing';

export interface Engine {
  readonly kind: EngineKind;
  turnInvocation(turn: PromptTurn): CommandInvocation;
  listInvocation(): CommandInvocation;
  parseSessionListing(stdout: string): readonly SessionListing[];
}
