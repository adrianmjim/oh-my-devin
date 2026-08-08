import { describe, expect, it } from 'vitest';
import { PROFILE_FILE_NAME } from './profile-file-name';

describe('PROFILE_FILE_NAME', () => {
  it('names the profile class file', () => {
    expect(PROFILE_FILE_NAME).toBe('profile.json');
  });
});
