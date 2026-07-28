import { ContractCompilationError } from './contract-compilation-error';

export function worktreeWriteRule(workingDirectory: string): string {
  if (workingDirectory.includes(')')) {
    throw new ContractCompilationError(
      `working directory "${workingDirectory}" cannot be expressed as a write rule: a permission pattern may not contain ")"`,
    );
  }
  return `Write(${workingDirectory}/**)`;
}
