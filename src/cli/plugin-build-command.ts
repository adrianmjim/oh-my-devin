export interface PluginBuildCommand {
  readonly kind: 'plugin-build';
  readonly out: string | null;
}
