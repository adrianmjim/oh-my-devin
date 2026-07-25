export interface E2eRunOptions {
  readonly stdin?: readonly string[];
  readonly env?: Readonly<Record<string, string>>;
}
