export type AuthorityPolicy = 'human' | 'proceed';

export function isAuthorityPolicy(value: unknown): value is AuthorityPolicy {
  return value === 'human' || value === 'proceed';
}
