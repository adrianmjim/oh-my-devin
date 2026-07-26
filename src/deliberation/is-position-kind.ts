import type { PositionKind } from './position-kind';

export function isPositionKind(value: unknown): value is PositionKind {
  return value === 'objection' || value === 'preference';
}
