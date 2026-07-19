import type { ProposerRequest } from './proposer-request';
import type { ProposerResult } from './proposer-result';

export type ProposerAction = (
  request: ProposerRequest,
) => Promise<ProposerResult>;
