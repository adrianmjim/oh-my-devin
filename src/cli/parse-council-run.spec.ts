import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import type { CouncilRunCommand } from './council-run-command';
import { parseCouncilRun } from './parse-council-run';

describe('parseCouncilRun', () => {
  it('parses the council and the question', () => {
    const command = parseCouncilRun(['run', 'design', 'ship it?']);

    expect(command.kind).toBe('council-run');
    const councilRun = command as CouncilRunCommand;
    expect(councilRun.council).toBe('design');
    expect(councilRun.question).toBe('ship it?');
    expect(councilRun.proposal).toBeNull();
    expect(councilRun.team).toBeNull();
    expect(councilRun.sign).toBe(false);
    expect(councilRun.json).toBe(false);
  });

  it('parses the separated proposal and follow-up team flags', () => {
    const command = parseCouncilRun([
      'run',
      'design',
      'ship it?',
      '--proposal',
      'p.md',
      '--then',
      'delivery',
    ]) as CouncilRunCommand;

    expect(command.proposal).toBe('p.md');
    expect(command.team).toBe('delivery');
  });

  it('parses the inline proposal and follow-up team flags', () => {
    const command = parseCouncilRun([
      'run',
      'design',
      'ship it?',
      '--proposal=p.md',
      '--then=delivery',
    ]) as CouncilRunCommand;

    expect(command.proposal).toBe('p.md');
    expect(command.team).toBe('delivery');
  });

  it('parses the sign and json flags', () => {
    const command = parseCouncilRun([
      'run',
      'design',
      'ship it?',
      '--sign',
      '--json',
    ]) as CouncilRunCommand;

    expect(command.sign).toBe(true);
    expect(command.json).toBe(true);
  });

  it('rejects a subcommand other than run', () => {
    expect(() => parseCouncilRun(['list'])).toThrow(UsageError);
  });

  it('rejects a missing question', () => {
    expect(() => parseCouncilRun(['run', 'design'])).toThrow(UsageError);
  });

  it('rejects a flag where the council is expected', () => {
    expect(() => parseCouncilRun(['run', '--json', 'ship it?'])).toThrow(
      UsageError,
    );
  });

  it('rejects a proposal flag without a value', () => {
    expect(() =>
      parseCouncilRun(['run', 'design', 'ship it?', '--proposal']),
    ).toThrow(UsageError);
    expect(() =>
      parseCouncilRun(['run', 'design', 'ship it?', '--proposal=']),
    ).toThrow(UsageError);
  });

  it('rejects an unknown flag', () => {
    expect(() =>
      parseCouncilRun(['run', 'design', 'ship it?', '--bogus']),
    ).toThrow(UsageError);
  });
});
