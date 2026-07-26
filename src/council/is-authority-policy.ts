import type { AuthorityPolicy } from './authority-policy';

export function isAuthorityPolicy(value: unknown): value is AuthorityPolicy {
  return value === 'human' || value === 'proceed';
}
