import type { SessionId } from './session-id';

export interface HookEvent {
  readonly sessionId: SessionId | null;
  readonly command: string | null;
  readonly tool: string | null;
  readonly filePath: string | null;
}
