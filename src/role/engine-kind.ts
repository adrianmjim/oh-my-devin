export type EngineKind = 'devin';

export function isEngineKind(value: unknown): value is EngineKind {
  return value === 'devin';
}
