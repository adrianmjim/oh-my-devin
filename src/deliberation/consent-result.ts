import type { TypedPosition } from './typed-position';

export interface ConsentResult {
  readonly consented: boolean;
  readonly blocking: readonly TypedPosition[];
}
