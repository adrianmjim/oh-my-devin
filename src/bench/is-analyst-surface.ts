import type { AnalystSurface } from './analyst-surface';

export function isAnalystSurface(value: unknown): value is AnalystSurface {
  return (
    value === 'criterion' ||
    value === 'question' ||
    value === 'assumption' ||
    value === 'risk'
  );
}
