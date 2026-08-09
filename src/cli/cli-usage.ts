import { formatLayerComponents } from '../setup/format-layer-components';

export const CLI_USAGE: string = [
  'omd — an organizational layer over the Devin CLI',
  '',
  'Usage:',
  '  omd run <role> "<task>" [--json] [--detach]   Run a role against a task end to end',
  '  omd status [--json]                           List active and recently terminated project runs',
  '  omd status <run-id> [--json]                  Show a bounded snapshot of a run',
  '  omd doctor                                    Check the local runtime contract',
  '  omd roles list [--json]                       List the project’s roles',
  '  omd roles show <role> [--json]                Show a role’s expanded contract',
  `  omd setup [--level=<project|user>] [--scope=<parts>]  Install the in-session layer (level: project|user; parts: ${formatLayerComponents(',')})`,
  '  omd plugin build [--out <dir>]                Build the installable devin plugin bundle',
  '  omd team run [<team>] "<task>"                Run a team pipeline (architect → executor → reviewer); omits <team> to launch the default',
  '  omd council run <c> "<question>"              Run a deliberation council [--proposal <path>] [--then <team>] [--sign] [--json]',
  '  omd mode <set|clear> [<mode>] [--run <run-id>]  Set or clear this session’s own mode state, optionally correlating a launched run',
  '  omd memory remember "<text>"                  Record a manual note in the project’s durable memory notepad',
  '  omd --version                                 Print the installed omd version',
  '',
].join('\n');
