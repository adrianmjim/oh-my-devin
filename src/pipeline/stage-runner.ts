import type { StageRequest } from './stage-request';
import type { StageResult } from './stage-result';

export type StageRunner = (request: StageRequest) => Promise<StageResult>;
