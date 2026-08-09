import type { CriticCategory } from './critic-category';

export function isCriticCategory(value: unknown): value is CriticCategory {
  return value === 'present_flaw' || value === 'missing_element';
}
