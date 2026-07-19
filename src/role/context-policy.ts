export type ContextPolicy = 'isolated' | 'shared';

export function isContextPolicy(value: unknown): value is ContextPolicy {
  return value === 'isolated' || value === 'shared';
}
