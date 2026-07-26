import type { CommentStyle } from './comment-style';

export interface RegionFraming {
  readonly id: string;
  readonly version: string;
  readonly style: CommentStyle;
  readonly content: string;
}
