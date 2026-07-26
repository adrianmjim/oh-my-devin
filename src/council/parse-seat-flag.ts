import { CouncilDeclarationError } from './council-declaration-error';

export function parseSeatFlag(
  value: unknown,
  role: string,
  field: string,
): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value !== 'boolean') {
    throw new CouncilDeclarationError(
      `seat "${role}" field "${field}" must be a boolean`,
    );
  }
  return value;
}
