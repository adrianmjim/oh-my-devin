export function isGateDecision(value: unknown): boolean {
  return value === 'approve' || value === 'reject' || value === 'none';
}
