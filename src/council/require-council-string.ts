import { CouncilDeclarationError } from './council-declaration-error';

export function requireCouncilString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new CouncilDeclarationError(`"${field}" must be a non-empty string`);
  }
  return value;
}
