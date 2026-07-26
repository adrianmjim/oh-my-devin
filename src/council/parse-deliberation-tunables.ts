import { CouncilDeclarationError } from './council-declaration-error';
import { DEFAULT_BLOCKING_THRESHOLD } from './default-blocking-threshold';
import type { DeliberationTunables } from './deliberation-tunables';
import { isSeverity } from './is-severity';
import type { Severity } from './severity';

export function parseDeliberationTunables(
  value: unknown,
): DeliberationTunables {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new CouncilDeclarationError('"deliberation" must be a mapping');
  }
  const fields: Record<string, unknown> = value as Record<string, unknown>;

  const roundsCapValue: unknown = fields['rounds_cap'];
  if (
    typeof roundsCapValue !== 'number' ||
    !Number.isInteger(roundsCapValue) ||
    roundsCapValue <= 0
  ) {
    throw new CouncilDeclarationError(
      '"rounds_cap" must be a positive integer',
    );
  }

  const thresholdValue: unknown = fields['blocking_threshold'];
  let blockingThreshold: Severity;
  if (thresholdValue === undefined || thresholdValue === null) {
    blockingThreshold = DEFAULT_BLOCKING_THRESHOLD;
  } else if (isSeverity(thresholdValue)) {
    blockingThreshold = thresholdValue;
  } else {
    throw new CouncilDeclarationError(
      `"blocking_threshold" must be one of low, medium, high, critical`,
    );
  }

  const wallTimeValue: unknown = fields['wall_time_ms'];
  let wallTimeMs: number | null;
  if (wallTimeValue === undefined || wallTimeValue === null) {
    wallTimeMs = null;
  } else if (typeof wallTimeValue === 'number' && wallTimeValue > 0) {
    wallTimeMs = wallTimeValue;
  } else {
    throw new CouncilDeclarationError(
      '"wall_time_ms" must be a positive number',
    );
  }

  return { roundsCap: roundsCapValue, blockingThreshold, wallTimeMs };
}
