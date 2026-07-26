import { CouncilDeclarationError } from './council-declaration-error';

export function parseSeatModel(value: unknown, role: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string' || value.length === 0) {
    throw new CouncilDeclarationError(
      `seat "${role}" field "model" must be a non-empty string`,
    );
  }
  return value;
}
