import { guardMessage } from './guard-message';
import type { PendingNotice } from './pending-notice';

export function renderGuardNotices(notices: readonly PendingNotice[]): string {
  return notices.length === 0
    ? ''
    : [
        'Write contract notices (omd):',
        ...notices.map(
          (notice: PendingNotice): string =>
            `- ${notice.tool} ${notice.filePath} — ${guardMessage(notice.filePath)}`,
        ),
      ].join('\n');
}
