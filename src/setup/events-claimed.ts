export interface EventsClaimed {
  readonly kind: 'claimed';
  readonly events: Record<string, unknown>;
}
