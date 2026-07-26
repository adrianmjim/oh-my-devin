export function isFailureTierOrNull(value: unknown): boolean {
  return (
    value === null ||
    value === 'deny' ||
    value === 'invalid_artifact' ||
    value === 'budget'
  );
}
