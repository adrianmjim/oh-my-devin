import type { OutcomeGroup } from './outcome-group';

export const OUTCOME_GROUPS: readonly OutcomeGroup[] = [
  { outcome: 'created', heading: 'Created:' },
  { outcome: 'updated', heading: 'Updated:' },
  { outcome: 'unchanged', heading: 'Unchanged:' },
  { outcome: 'preserved', heading: 'Preserved:' },
  { outcome: 'conflicted', heading: 'Conflicted:' },
  { outcome: 'blocked', heading: 'Blocked:' },
];
