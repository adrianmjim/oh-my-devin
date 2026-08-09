import type { TruthDocument } from './truth-document';

export type TruthParser = (
  fields: Record<string, unknown>,
  source: string,
) => TruthDocument;
