import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import type {
  CouncilRunCommand,
  ModeSetCommand,
  PluginBuildCommand,
  RolesShowCommand,
  RunCommand,
  SetupCommand,
  StatusCommand,
  TeamRunCommand,
} from './cli-command';
import { parseCliArgs } from './parse-cli-args';

describe('parseCliArgs', () => {
  it('returns the help command for no arguments', () => {
    expect(parseCliArgs([]).kind).toBe('help');
    expect(parseCliArgs(['--help']).kind).toBe('help');
  });

  it('parses `run <role> <task>` with the default text output', () => {
    const command = parseCliArgs(['run', 'reviewer', 'assess the diff']);
    expect(command.kind).toBe('run');
    const run = command as RunCommand;
    expect(run.role).toBe('reviewer');
    expect(run.task).toBe('assess the diff');
    expect(run.json).toBe(false);
  });

  it('parses the --json flag on run regardless of position', () => {
    const command = parseCliArgs(['run', 'reviewer', 'assess', '--json']);
    expect((command as RunCommand).json).toBe(true);
  });

  it('rejects `run` without a task as a usage error', () => {
    expect(() => parseCliArgs(['run', 'reviewer'])).toThrow(UsageError);
    expect(() => parseCliArgs(['run'])).toThrow(UsageError);
  });

  it('defaults run to the blocking form and reads the --detach flag', () => {
    const blocking = parseCliArgs(['run', 'reviewer', 'assess']);
    expect((blocking as RunCommand).detach).toBe(false);

    const detached = parseCliArgs(['run', 'reviewer', 'assess', '--detach']);
    expect((detached as RunCommand).detach).toBe(true);
    expect((detached as RunCommand).role).toBe('reviewer');
    expect((detached as RunCommand).task).toBe('assess');
  });

  it('parses `status <run-id>` with the default text output', () => {
    const command = parseCliArgs(['status', 'run-123']);
    expect(command.kind).toBe('status');
    const status = command as StatusCommand;
    expect(status.runId).toBe('run-123');
    expect(status.json).toBe(false);
  });

  it('parses the --json flag on status', () => {
    const command = parseCliArgs(['status', 'run-123', '--json']);
    expect((command as StatusCommand).json).toBe(true);
  });

  it('rejects `status` without a run id as a usage error', () => {
    expect(() => parseCliArgs(['status'])).toThrow(UsageError);
  });

  it('parses the doctor command', () => {
    expect(parseCliArgs(['doctor']).kind).toBe('doctor');
  });

  it('parses `roles list` with and without --json', () => {
    expect(parseCliArgs(['roles', 'list']).kind).toBe('roles-list');
    const command = parseCliArgs(['roles', 'list', '--json']);
    expect(command.kind).toBe('roles-list');
    expect('json' in command && command.json).toBe(true);
  });

  it('parses `roles show <role>`', () => {
    const command = parseCliArgs(['roles', 'show', 'reviewer']);
    expect(command.kind).toBe('roles-show');
    expect((command as RolesShowCommand).role).toBe('reviewer');
  });

  it('rejects `roles show` without a role name', () => {
    expect(() => parseCliArgs(['roles', 'show'])).toThrow(UsageError);
  });

  it('rejects an unknown roles subcommand', () => {
    expect(() => parseCliArgs(['roles', 'delete'])).toThrow(UsageError);
  });

  it('parses the setup command with a null scope by default', () => {
    const command = parseCliArgs(['setup']);
    expect(command.kind).toBe('setup');
    expect((command as SetupCommand).scope).toBeNull();
  });

  it('parses a comma-separated setup scope', () => {
    const command = parseCliArgs(['setup', '--scope=skills,hooks']);
    expect((command as SetupCommand).scope).toEqual(['skills', 'hooks']);
  });

  it('rejects an unknown setup scope component', () => {
    expect(() => parseCliArgs(['setup', '--scope=bogus'])).toThrow(UsageError);
  });

  it('rejects an unknown top-level command', () => {
    expect(() => parseCliArgs(['frobnicate'])).toThrow(UsageError);
  });

  it('parses `plugin build` with the default output directory', () => {
    const command = parseCliArgs(['plugin', 'build']);
    expect(command.kind).toBe('plugin-build');
    expect((command as PluginBuildCommand).out).toBeNull();
  });

  it('parses `plugin build --out <dir>`', () => {
    const command = parseCliArgs(['plugin', 'build', '--out', 'dist/plugin']);
    expect((command as PluginBuildCommand).out).toBe('dist/plugin');
  });

  it('parses `plugin build --out=<dir>`', () => {
    const command = parseCliArgs(['plugin', 'build', '--out=dist/plugin']);
    expect((command as PluginBuildCommand).out).toBe('dist/plugin');
  });

  it('rejects `plugin build --out` without a directory', () => {
    expect(() => parseCliArgs(['plugin', 'build', '--out'])).toThrow(
      UsageError,
    );
  });

  it('rejects an unknown plugin build flag', () => {
    expect(() => parseCliArgs(['plugin', 'build', '--bogus'])).toThrow(
      UsageError,
    );
  });

  it('rejects an unknown plugin subcommand', () => {
    expect(() => parseCliArgs(['plugin', 'install'])).toThrow(UsageError);
  });

  it('parses `team run <team> <task>` with the default text output', () => {
    const command = parseCliArgs(['team', 'run', 'feature-team', 'build it']);
    expect(command.kind).toBe('team-run');
    const teamRun = command as TeamRunCommand;
    expect(teamRun.team).toBe('feature-team');
    expect(teamRun.task).toBe('build it');
    expect(teamRun.json).toBe(false);
  });

  it('parses the --json flag on team run', () => {
    const command = parseCliArgs([
      'team',
      'run',
      'feature-team',
      'build it',
      '--json',
    ]);
    expect((command as TeamRunCommand).json).toBe(true);
  });

  it('rejects `team run` without a task as a usage error', () => {
    expect(() => parseCliArgs(['team', 'run', 'feature-team'])).toThrow(
      UsageError,
    );
  });

  it('rejects a detached launch for team run as a usage error', () => {
    expect(() =>
      parseCliArgs(['team', 'run', 'feature-team', 'build it', '--detach']),
    ).toThrow(UsageError);
  });

  it('rejects an unknown team subcommand', () => {
    expect(() => parseCliArgs(['team', 'delete', 'feature-team'])).toThrow(
      UsageError,
    );
  });

  it('parses `council run <council> <question>` with defaults', () => {
    const command = parseCliArgs(['council', 'run', 'design', 'ship it?']);
    expect(command.kind).toBe('council-run');
    const councilRun = command as CouncilRunCommand;
    expect(councilRun.council).toBe('design');
    expect(councilRun.question).toBe('ship it?');
    expect(councilRun.proposal).toBeNull();
    expect(councilRun.team).toBeNull();
    expect(councilRun.sign).toBe(false);
    expect(councilRun.json).toBe(false);
  });

  it('parses council run flags in the = form: --proposal=, --then=, --sign, --json', () => {
    const command = parseCliArgs([
      'council',
      'run',
      'design',
      'ship it?',
      '--proposal=proposal.md',
      '--then=feature-team',
      '--sign',
      '--json',
    ]);
    const councilRun = command as CouncilRunCommand;
    expect(councilRun.proposal).toBe('proposal.md');
    expect(councilRun.team).toBe('feature-team');
    expect(councilRun.sign).toBe(true);
    expect(councilRun.json).toBe(true);
  });

  it('parses council run flags in the space form: --proposal <path> --then <team>', () => {
    const command = parseCliArgs([
      'council',
      'run',
      'design',
      'ship it?',
      '--proposal',
      'proposal.md',
      '--then',
      'feature-team',
      '--sign',
      '--json',
    ]);
    const councilRun = command as CouncilRunCommand;
    expect(councilRun.proposal).toBe('proposal.md');
    expect(councilRun.team).toBe('feature-team');
    expect(councilRun.sign).toBe(true);
    expect(councilRun.json).toBe(true);
  });

  it('rejects a space-form council flag whose value is missing', () => {
    expect(() =>
      parseCliArgs(['council', 'run', 'design', 'ship it?', '--proposal']),
    ).toThrow(UsageError);
    expect(() =>
      parseCliArgs([
        'council',
        'run',
        'design',
        'ship it?',
        '--then',
        '--sign',
      ]),
    ).toThrow(UsageError);
  });

  it('rejects an empty = form council flag value', () => {
    expect(() =>
      parseCliArgs(['council', 'run', 'design', 'ship it?', '--proposal=']),
    ).toThrow(UsageError);
  });

  it('rejects an unknown council run flag', () => {
    expect(() =>
      parseCliArgs([
        'council',
        'run',
        'design',
        'ship it?',
        '--team=feature-team',
      ]),
    ).toThrow(UsageError);
  });

  it('rejects a surplus council run positional', () => {
    expect(() =>
      parseCliArgs(['council', 'run', 'design', 'ship it?', 'extra']),
    ).toThrow(UsageError);
  });

  it('rejects `council run` without a question', () => {
    expect(() => parseCliArgs(['council', 'run', 'design'])).toThrow(
      UsageError,
    );
  });

  it('rejects an unknown council subcommand', () => {
    expect(() => parseCliArgs(['council', 'convene', 'design'])).toThrow(
      UsageError,
    );
  });

  it('parses `mode set <mode>`', () => {
    const command = parseCliArgs(['mode', 'set', 'team']);
    expect(command.kind).toBe('mode-set');
    expect((command as ModeSetCommand).mode).toBe('team');
  });

  it('parses `mode clear`', () => {
    expect(parseCliArgs(['mode', 'clear']).kind).toBe('mode-clear');
  });

  it('rejects `mode set` without a mode name', () => {
    expect(() => parseCliArgs(['mode', 'set'])).toThrow(UsageError);
  });

  it('rejects an unknown mode subcommand', () => {
    expect(() => parseCliArgs(['mode'])).toThrow(UsageError);
    expect(() => parseCliArgs(['mode', 'frobnicate'])).toThrow(UsageError);
  });

  it('rejects surplus mode arguments', () => {
    expect(() => parseCliArgs(['mode', 'set', 'team', 'extra'])).toThrow(
      UsageError,
    );
    expect(() => parseCliArgs(['mode', 'clear', 'extra'])).toThrow(UsageError);
  });
});
