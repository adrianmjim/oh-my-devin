import type { EngineKind } from './engine-kind';

export function isEngineKind(value: unknown): value is EngineKind {
  return value === 'devin';
}
