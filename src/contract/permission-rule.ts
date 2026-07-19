export interface PermissionRule {
  readonly verb: string;
  readonly pattern: string | null;
}
