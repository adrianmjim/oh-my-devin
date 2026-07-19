import Ajv from 'ajv';
import type { AnySchema, ErrorObject, ValidateFunction } from 'ajv';

export function validateAgainstSchema(
  value: unknown,
  schema: object,
): readonly string[] {
  const validate: ValidateFunction = new Ajv({
    allErrors: true,
    strict: false,
  }).compile(schema as AnySchema);

  if (validate(value)) {
    return [];
  }

  return (validate.errors ?? []).map((error: ErrorObject): string => {
    const location: string =
      error.instancePath === '' ? '(root)' : error.instancePath;
    return `${location} ${error.message ?? 'is invalid'}`;
  });
}
