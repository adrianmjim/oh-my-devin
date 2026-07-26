import type { PipelineReport } from '../pipeline/pipeline-report';
import type { LaunchRequest } from './launch-request';

export type PipelineLauncher = (
  request: LaunchRequest,
) => Promise<PipelineReport>;
