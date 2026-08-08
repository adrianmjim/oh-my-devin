import type { MemoryDelivery } from './memory-delivery';
import type { ProfileSnapshot } from './profile-snapshot';
import { orEmptyList } from './or-empty-list';

export function renderMemoryDelivery(delivery: MemoryDelivery): string {
  const lines: string[] = [];
  const profile: ProfileSnapshot | null = delivery.profile;
  if (profile !== null) {
    lines.push(
      `Profile: stack ${orEmptyList(profile.stack)}; layout ${orEmptyList(
        profile.layout,
      )}; entry commands ${orEmptyList(profile.entryCommands)}.`,
    );
  }
  if (delivery.notepad.length > 0) {
    lines.push('Notes:');
    for (const entry of delivery.notepad) {
      lines.push(`- [${entry.kind}] ${entry.text}`);
    }
  }
  return lines.length === 0
    ? ''
    : ['Project memory (omd, read-only):', ...lines].join('\n');
}
