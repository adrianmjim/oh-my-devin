import { describe, expect, it } from 'vitest';
import { REVIEWER_ROLE_AGENT_MD } from '../setup/reviewer-role-agent-md';
import { rolePromptDigest } from './role-prompt-digest';

describe('rolePromptDigest', () => {
  it('digests a prompt body to a stable hex string', () => {
    const digest: string = rolePromptDigest('You are the reviewer.');

    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(rolePromptDigest('You are the reviewer.')).toBe(digest);
  });

  it('moves when the prompt body changes', () => {
    expect(rolePromptDigest('a')).not.toBe(rolePromptDigest('b'));
  });

  it('digests the shipped seed prompt', () => {
    expect(rolePromptDigest(REVIEWER_ROLE_AGENT_MD)).toMatch(/^[0-9a-f]{64}$/);
  });
});
