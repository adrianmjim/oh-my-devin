import type { CouncilRunCommand } from './council-run-command';
import type { DoctorCommand } from './doctor-command';
import type { HelpCommand } from './help-command';
import type { HookCommand } from './hook-command';
import type { MemoryRememberCommand } from './memory-remember-command';
import type { ModeClearCommand } from './mode-clear-command';
import type { ModeSetCommand } from './mode-set-command';
import type { PluginBuildCommand } from './plugin-build-command';
import type { RolesListCommand } from './roles-list-command';
import type { RolesShowCommand } from './roles-show-command';
import type { RunCommand } from './run-command';
import type { SetupCommand } from './setup-command';
import type { StatusCommand } from './status-command';
import type { StatusListCommand } from './status-list-command';
import type { TeamRunCommand } from './team-run-command';
import type { VersionCommand } from './version-command';

export type CliCommand =
  | RunCommand
  | StatusCommand
  | StatusListCommand
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
  | ModeClearCommand
  | MemoryRememberCommand
  | HookCommand;
