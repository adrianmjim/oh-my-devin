import type { EventFieldCheck } from './event-field-check';
import { EVENT_FIELD_CHECKS } from './event-field-checks';
import type { ProgressEvent } from './progress-event';

export function isProgressEvent(value: unknown): value is ProgressEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record: Record<string, unknown> = value as Record<string, unknown>;
  if (typeof record['timestamp'] !== 'number') {
    return false;
  }
  const type: unknown = record['type'];
  const check: EventFieldCheck | undefined =
    typeof type === 'string' ? EVENT_FIELD_CHECKS[type] : undefined;
  return check?.(record) ?? false;
}
