import type { SessionId } from './session-id';

export type SessionLivenessPredicate = (sessionId: SessionId) => boolean;
