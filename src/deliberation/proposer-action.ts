import type { ProposerRequest } from './proposer-request';

export type ProposerAction = (request: ProposerRequest) => Promise<string>;
