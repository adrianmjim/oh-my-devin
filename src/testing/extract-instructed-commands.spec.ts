import { describe, expect, it } from 'vitest';
import { extractInstructedCommands } from './extract-instructed-commands';

const SKILL_WITH_COMMANDS: string = [
  '---',
  'name: team',
  'description: Run a declared team pipeline.',
  'permissions:',
  '  allow:',
  '    - "Exec(omd)"',
  '---',
  '',
  'When the user asks to run a team on a task, run:',
  '',
  '    omd team run <team> "<task>"',
  '',
  'To delegate a single role instead, run:',
  '',
  '    omd run <role> "<task>"',
  '',
  'On activation, run:',
  '',
  '    omd mode set team',
  '',
  'Once the criteria are met, run:',
  '',
  '    omd mode clear',
  '',
].join('\n');

describe('extractInstructedCommands', () => {
  it('extracts every indented omd command line as an argv array', () => {
    const commands: readonly (readonly string[])[] =
      extractInstructedCommands(SKILL_WITH_COMMANDS);

    expect(commands).toHaveLength(4);
    expect(commands[0]?.[0]).toBe('team');
    expect(commands[1]?.[0]).toBe('run');
    expect(commands[2]).toEqual(['mode', 'set', 'team']);
    expect(commands[3]).toEqual(['mode', 'clear']);
  });

  it('drops the leading omd word and collapses a quoted task into one token', () => {
    const commands: readonly (readonly string[])[] = extractInstructedCommands(
      '    omd run <role> "<task>"',
    );

    expect(commands).toHaveLength(1);
    expect(commands[0]).toHaveLength(3);
    expect(commands[0]?.[0]).toBe('run');
  });

  it('substitutes the role, task, and team placeholders', () => {
    const commands: readonly (readonly string[])[] = extractInstructedCommands(
      ['    omd run <role> "<task>"', '    omd team run <team> "<task>"'].join(
        '\n',
      ),
    );

    for (const command of commands) {
      for (const token of command) {
        expect(token).not.toContain('<role>');
        expect(token).not.toContain('<task>');
        expect(token).not.toContain('<team>');
        expect(token.length).toBeGreaterThan(0);
      }
    }
  });

  it('ignores prose mentions of omd and the Exec(omd) permission line', () => {
    const skill: string = [
      '---',
      'permissions:',
      '  allow:',
      '    - "Exec(omd)"',
      '---',
      '',
      'omd runs the role under its budget; this skill owns no loop of its own.',
      '',
    ].join('\n');

    expect(extractInstructedCommands(skill)).toEqual([]);
  });
});
