import type { LayerComponent } from '../setup/layer-component';

export interface RunCommand {
  readonly kind: 'run';
  readonly role: string;
  readonly task: string;
  readonly json: boolean;
  readonly detach: boolean;
}

export interface StatusCommand {
  readonly kind: 'status';
  readonly runId: string;
  readonly json: boolean;
}

export interface DoctorCommand {
  readonly kind: 'doctor';
}

export interface RolesListCommand {
  readonly kind: 'roles-list';
  readonly json: boolean;
}

export interface RolesShowCommand {
  readonly kind: 'roles-show';
  readonly role: string;
  readonly json: boolean;
}

export interface SetupCommand {
  readonly kind: 'setup';
  readonly scope: readonly LayerComponent[] | null;
}

export interface HelpCommand {
  readonly kind: 'help';
}

export interface VersionCommand {
  readonly kind: 'version';
}

export interface PluginBuildCommand {
  readonly kind: 'plugin-build';
  readonly out: string | null;
}

export interface TeamRunCommand {
  readonly kind: 'team-run';
  readonly team: string;
  readonly task: string;
  readonly json: boolean;
}

export interface CouncilRunCommand {
  readonly kind: 'council-run';
  readonly council: string;
  readonly question: string;
  readonly proposal: string | null;
  readonly team: string | null;
  readonly sign: boolean;
  readonly json: boolean;
}

export interface ModeSetCommand {
  readonly kind: 'mode-set';
  readonly mode: string;
}

export interface ModeClearCommand {
  readonly kind: 'mode-clear';
}

export type CliCommand =
  | RunCommand
  | StatusCommand
  | DoctorCommand
  | RolesListCommand
  | RolesShowCommand
  | SetupCommand
  | HelpCommand
  | VersionCommand
  | PluginBuildCommand
  | TeamRunCommand
  | CouncilRunCommand
  | ModeSetCommand
  | ModeClearCommand;
