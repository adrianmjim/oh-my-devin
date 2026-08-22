import { matchesTrigger } from '../memory/matches-trigger';
import type { DirectiveMarker } from './directive-marker';
import { DIRECTIVE_MARKERS } from './directive-markers';

export function scoreMoment(text: string): number {
  const normalized: string = text.toLowerCase();
  const weight: number = DIRECTIVE_MARKERS.reduce(
    (held: number, marker: DirectiveMarker): number =>
      matchesTrigger(normalized, marker.phrase) && marker.weight > held
        ? marker.weight
        : held,
    0,
  );
  const words: number = normalized
    .split(/\s+/)
    .filter((word: string): boolean => word !== '').length;
  const specificity: number = words >= 6 ? 0.2 : 0;
  const breadth: number = words >= 8 ? 0.1 : 0;
  const score: number = weight === 0 ? 0 : weight + specificity + breadth;
  return score > 1 ? 1 : score;
}
