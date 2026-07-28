export function worktreeWriteRule(workingDirectory: string): string {
  return `Write(${workingDirectory}/**)`;
}
