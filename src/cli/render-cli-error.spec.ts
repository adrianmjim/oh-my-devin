import { describe, expect, it } from 'vitest';
import { exitCodeForOutcome } from '../outcome/exit-code-for-outcome';
import { USAGE_ERROR_EXIT_CODE } from '../outcome/usage-error-exit-code';
import { UsageError } from '../run/usage-error';
import type { CliErrorRendering } from './cli-error-rendering';
import { renderCliError } from './render-cli-error';

describe('renderCliError', () => {
  it('renders a usage error as plain text with exit code 64', () => {
    const rendering: CliErrorRendering = renderCliError(
      new UsageError('unknown command "frobnicate"'),
      false,
    );

    expect(rendering.stderrText).toBe(
      'usage error: unknown command "frobnicate"',
    );
    expect(rendering.exitCode).toBe(USAGE_ERROR_EXIT_CODE);
  });

  it('renders a usage error as a JSON object when --json was requested', () => {
    const rendering: CliErrorRendering = renderCliError(
      new UsageError('unknown command "frobnicate"'),
      true,
    );

    expect(JSON.parse(rendering.stderrText)).toStrictEqual({
      error: 'unknown command "frobnicate"',
      exitCode: USAGE_ERROR_EXIT_CODE,
    });
    expect(rendering.exitCode).toBe(USAGE_ERROR_EXIT_CODE);
  });

  it('renders an unknown Error as plain text with exit code 1', () => {
    const rendering: CliErrorRendering = renderCliError(
      new Error('boom'),
      false,
    );

    expect(rendering.stderrText).toBe('error: boom');
    expect(rendering.exitCode).toBe(1);
  });

  it('renders a thrown non-Error value as plain text with exit code 1', () => {
    const rendering: CliErrorRendering = renderCliError('boom', true);

    expect(rendering.stderrText).toBe('error: boom');
    expect(rendering.exitCode).toBe(1);
  });

  it('keeps the CLI exit-code set pairwise distinct', () => {
    const codes: readonly number[] = [
      exitCodeForOutcome(null),
      exitCodeForOutcome('deny'),
      exitCodeForOutcome('invalid_artifact'),
      exitCodeForOutcome('budget'),
      USAGE_ERROR_EXIT_CODE,
    ];

    expect(codes).toEqual([0, 2, 3, 4, 64]);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
