import type { ModeSkill } from './mode-skill';
import { AUTOPILOT_SKILL } from './autopilot-skill';
import { DEEP_DIVE_SKILL } from './deep-dive-skill';
import { PLAN_SKILL } from './plan-skill';
import { RALPH_SKILL } from './ralph-skill';
import { TEAM_SKILL } from './team-skill';
import { VERIFY_SKILL } from './verify-skill';

export const MODE_CATALOG: readonly ModeSkill[] = [
  {
    name: 'autopilot',
    lane: 'contractual',
    delegatesTo: 'pipeline',
    content: AUTOPILOT_SKILL,
  },
  {
    name: 'ralph',
    lane: 'contractual',
    delegatesTo: 'omd-run',
    content: RALPH_SKILL,
  },
  {
    name: 'team',
    lane: 'contractual',
    delegatesTo: 'pipeline',
    content: TEAM_SKILL,
  },
  {
    name: 'plan',
    lane: 'contractual',
    delegatesTo: 'omd-run',
    content: PLAN_SKILL,
  },
  {
    name: 'verify',
    lane: 'contractual',
    delegatesTo: 'omd-run',
    content: VERIFY_SKILL,
  },
  {
    name: 'deep-dive',
    lane: 'conversational',
    delegatesTo: 'none',
    content: DEEP_DIVE_SKILL,
  },
];
