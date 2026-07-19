import type { ConsentResult } from './consent-result';
import type { TypedPosition } from './typed-position';

export interface RoundResult {
  readonly proposal: string;
  readonly positions: readonly TypedPosition[];
  readonly consent: ConsentResult;
}
