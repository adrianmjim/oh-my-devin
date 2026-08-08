import { describe, expect, it } from 'vitest';
import { ALL_APPROVAL_POSTURES } from '../contract/all-approval-postures';
import { devinPermissionModeFor } from './devin-permission-mode-for';

describe('devinPermissionModeFor', () => {
  it('maps the artifact-write posture to the workspace-edit mode', () => {
    expect(devinPermissionModeFor('artifact-write')).toBe('accept-edits');
  });

  it('maps the command-execution posture to the approve-everything mode', () => {
    expect(devinPermissionModeFor('command-execution')).toBe('dangerous');
  });

  it('maps every posture omd can derive to a devin mode', () => {
    for (const posture of ALL_APPROVAL_POSTURES) {
      const mode: string = devinPermissionModeFor(posture);
      expect(mode.length).toBeGreaterThan(0);
    }
  });
});
