import type { ApprovalPosture } from '../contract/approval-posture';

export function devinPermissionModeFor(posture: ApprovalPosture): string {
  const modes: Record<ApprovalPosture, string> = {
    'artifact-write': 'accept-edits',
    'command-execution': 'dangerous',
  };
  return modes[posture];
}
