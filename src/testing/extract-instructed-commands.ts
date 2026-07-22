const COMMAND_LINE_PATTERN: RegExp = /^\s+omd\s+\S/;
const TOKEN_PATTERN: RegExp = /"([^"]*)"|(\S+)/g;

const PLACEHOLDER_VALUES: Record<string, string> = {
  '<role>': 'reviewer',
  '<task>': 'ship it',
  '<team>': 'delivery',
};

function tokenize(line: string): readonly string[] {
  const tokens: string[] = [];
  for (const match of line.matchAll(TOKEN_PATTERN)) {
    const quoted: string | undefined = match[1];
    const bare: string | undefined = match[2];
    tokens.push(quoted ?? bare ?? '');
  }
  return tokens;
}

function substitute(token: string): string {
  return PLACEHOLDER_VALUES[token] ?? token;
}

export function extractInstructedCommands(
  skill: string,
): readonly (readonly string[])[] {
  const commands: (readonly string[])[] = [];
  const commandLines: readonly string[] = skill
    .split('\n')
    .filter((line: string): boolean => COMMAND_LINE_PATTERN.test(line));
  for (const line of commandLines) {
    const tokens: readonly string[] = tokenize(line.trim());
    commands.push(tokens.slice(1).map(substitute));
  }
  return commands;
}
