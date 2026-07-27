import { describe, expect, it } from 'vitest';
import { ROLE_BODY_SECTIONS } from './role-body-sections';

describe('ROLE_BODY_SECTIONS', () => {
  it('lists the ten sections of the role-body standard', () => {
    expect(ROLE_BODY_SECTIONS).toHaveLength(10);
  });

  it('opens on the mission and closes on the self-check', () => {
    expect(ROLE_BODY_SECTIONS[0]).toBe('Mission');
    expect(ROLE_BODY_SECTIONS[ROLE_BODY_SECTIONS.length - 1]).toBe(
      'Final checklist',
    );
  });

  it('names each section once', () => {
    expect(new Set(ROLE_BODY_SECTIONS).size).toBe(ROLE_BODY_SECTIONS.length);
  });
});
