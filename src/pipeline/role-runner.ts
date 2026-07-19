import type { RunReport } from '../outcome/run-report';
import type { RunRoleOptions } from '../run/run-role-options';

export type RoleRunner = (options: RunRoleOptions) => Promise<RunReport>;
