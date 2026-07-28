import type { ReworkDesignation } from './rework-designation';

export const REWORK_ARTIFACTS: readonly ReworkDesignation[] = [
  {
    rejectedBy: 'reviewer',
    reentered: 'executor',
    artifacts: ['review.json', 'diff'],
  },
];
