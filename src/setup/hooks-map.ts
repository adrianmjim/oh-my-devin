import { buildHooksEventMap } from './build-hooks-event-map';
import { PROJECT_HOOK_COMMAND } from './project-hook-command';

export const HOOKS_MAP: string = `${JSON.stringify(
  buildHooksEventMap(PROJECT_HOOK_COMMAND),
  null,
  2,
)}\n`;
