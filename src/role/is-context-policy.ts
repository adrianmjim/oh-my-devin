import type { ContextPolicy } from './context-policy';

export function isContextPolicy(value: unknown): value is ContextPolicy {
  return value === 'isolated' || value === 'shared';
}
