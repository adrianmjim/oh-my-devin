import type { Severity } from '../council/severity';
import { severityAtLeast } from '../council/severity';
import type { ConsentResult } from './consent-result';
import type { TypedPosition } from './typed-position';

export function evaluateConsent(
  positions: readonly TypedPosition[],
  threshold: Severity,
): ConsentResult {
  const blocking: readonly TypedPosition[] = positions.filter(
    (position: TypedPosition): boolean => isBlocking(position, threshold),
  );
  return { consented: blocking.length === 0, blocking };
}

function isBlocking(position: TypedPosition, threshold: Severity): boolean {
  if (position.kind !== 'objection') {
    return false;
  }
  if (!severityAtLeast(position.severity, threshold)) {
    return false;
  }
  return domainWithinLens(position.domain, position.lens);
}

function domainWithinLens(domain: string, lens: string): boolean {
  const lensTokens: ReadonlySet<string> = new Set(tokenize(lens));
  const domainTokens: readonly string[] = tokenize(domain);
  if (domainTokens.length === 0) {
    return false;
  }
  return domainTokens.every((token: string): boolean => lensTokens.has(token));
}

function tokenize(value: string): readonly string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token: string): boolean => token.length > 0);
}
