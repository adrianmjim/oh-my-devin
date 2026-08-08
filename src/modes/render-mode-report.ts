import type { ModeReport } from './mode-report';

export function renderModeReport(report: ModeReport): string {
  let rendered: string;
  switch (report.kind) {
    case 'joined':
      rendered =
        report.alongside.length === 0
          ? `mode set: ${report.mode}`
          : `mode set: ${report.mode} (alongside ${report.alongside.join(', ')})`;
      break;
    case 'displaced':
      rendered = `mode set: ${report.mode} (displaced ${report.displaced})`;
      break;
    case 'refused':
      rendered =
        report.holder === null
          ? `mode refused: ${report.mode} — no live session owns this invocation`
          : `mode refused: ${report.mode} — ${report.holder.mode} is held by session ${report.holder.sessionId}`;
      break;
    case 'cleared':
      rendered =
        report.modes.length === 0
          ? 'mode cleared: nothing was active'
          : `mode cleared: ${report.modes.join(', ')}`;
      break;
  }
  return rendered;
}
