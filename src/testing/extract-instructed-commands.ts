import { COMMAND_LINE_PATTERN } from './command-line-pattern';
import { substitutePlaceholder } from './substitute-placeholder';
import { tokenizeCommandLine } from './tokenize-command-line';

export function extractInstructedCommands(
  skill: string,
): readonly (readonly string[])[] {
  const commands: (readonly string[])[] = [];
  const commandLines: readonly string[] = skill
    .split('\n')
    .filter((line: string): boolean => COMMAND_LINE_PATTERN.test(line));
  for (const line of commandLines) {
    const tokens: readonly string[] = tokenizeCommandLine(line.trim());
    commands.push(tokens.slice(1).map(substitutePlaceholder));
  }
  return commands;
}
