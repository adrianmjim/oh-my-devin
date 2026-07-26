import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import type { PluginBuildCommand } from './plugin-build-command';
import { parsePluginBuild } from './parse-plugin-build';

describe('parsePluginBuild', () => {
  it('parses the build subcommand with no output directory', () => {
    const command = parsePluginBuild(['build']);

    expect(command.kind).toBe('plugin-build');
    expect((command as PluginBuildCommand).out).toBeNull();
  });

  it('parses the separated output flag', () => {
    const command = parsePluginBuild([
      'build',
      '--out',
      'dist/plugin',
    ]) as PluginBuildCommand;

    expect(command.out).toBe('dist/plugin');
  });

  it('parses the inline output flag', () => {
    const command = parsePluginBuild([
      'build',
      '--out=dist/plugin',
    ]) as PluginBuildCommand;

    expect(command.out).toBe('dist/plugin');
  });

  it('rejects a subcommand other than build', () => {
    expect(() => parsePluginBuild(['bundle'])).toThrow(UsageError);
  });

  it('rejects the output flag without a value', () => {
    expect(() => parsePluginBuild(['build', '--out'])).toThrow(UsageError);
    expect(() => parsePluginBuild(['build', '--out='])).toThrow(UsageError);
  });

  it('rejects an unknown flag', () => {
    expect(() => parsePluginBuild(['build', '--bogus'])).toThrow(UsageError);
  });
});
