export function arrayItemSchema(source: string, property: string): object {
  const schema: Record<string, unknown> = JSON.parse(source) as Record<
    string,
    unknown
  >;
  const properties: Record<string, unknown> = schema['properties'] as Record<
    string,
    unknown
  >;
  const arraySchema: Record<string, unknown> = properties[property] as Record<
    string,
    unknown
  >;

  return arraySchema['items'] as object;
}
