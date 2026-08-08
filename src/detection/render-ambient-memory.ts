import type { AmbientMemory } from './ambient-memory';

export function renderAmbientMemory(ambient: AmbientMemory): string {
  const lines: string[] = [];
  if (ambient.priority.length > 0) {
    lines.push('Priority notes:');
    for (const entry of ambient.priority) {
      lines.push(`- ${entry.text}`);
    }
  }
  if (ambient.knowledge.length > 0) {
    lines.push('Knowledge:');
    for (const entry of ambient.knowledge) {
      lines.push(`- ${entry.text}`);
    }
  }
  if (ambient.rules.length > 0) {
    lines.push('Rules for the paths this session touched:');
    for (const rule of ambient.rules) {
      lines.push(`- ${rule.text}`);
    }
  }
  if (ambient.proposals.length > 0) {
    lines.push('Worth remembering? Confirm with the command shown:');
    for (const candidate of ambient.proposals) {
      lines.push(`- ${candidate.principle}`);
      lines.push(`  ${candidate.confirmingCommand}`);
    }
  }
  return lines.length === 0
    ? ''
    : ['Project memory (omd):', ...lines].join('\n');
}
