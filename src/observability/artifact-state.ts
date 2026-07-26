export function artifactState(valid: boolean | null): string {
  if (valid === null) {
    return 'pending';
  }
  return valid ? 'valid' : 'invalid';
}
