import type { DirectiveMarker } from './directive-marker';

export const DIRECTIVE_MARKERS: readonly DirectiveMarker[] = [
  { phrase: 'from now on', weight: 0.5 },
  { phrase: 'always', weight: 0.5 },
  { phrase: 'never', weight: 0.5 },
  { phrase: 'remember that', weight: 0.5 },
  { phrase: 'do not', weight: 0.4 },
  { phrase: "don't", weight: 0.4 },
  { phrase: 'make sure', weight: 0.4 },
  { phrase: 'prefer', weight: 0.4 },
  { phrase: 'prefers', weight: 0.4 },
  { phrase: 'preferred', weight: 0.4 },
];
