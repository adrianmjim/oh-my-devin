import { join } from 'node:path';
import { modeStateRoot } from './mode-state-root';
import type { SessionId } from './session-id';

export class SessionStatePaths {
  public readonly dir: string;
  public readonly seen: string;
  public readonly slots: string;
  public readonly staged: string;
  public readonly stops: string;
  public readonly notices: string;

  public constructor(baseDir: string, sessionId: SessionId) {
    this.dir = join(modeStateRoot(baseDir), sessionId);
    this.seen = join(this.dir, 'seen.json');
    this.slots = join(this.dir, 'slots.json');
    this.staged = join(this.dir, 'staged.json');
    this.stops = join(this.dir, 'stops.json');
    this.notices = join(this.dir, 'notices.json');
  }
}
