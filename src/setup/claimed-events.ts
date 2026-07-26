import type { HooksEventMap } from './hooks-event-map';

export const CLAIMED_EVENTS: readonly (keyof HooksEventMap)[] = [
  'SessionStart',
  'UserPromptSubmit',
  'Stop',
];
