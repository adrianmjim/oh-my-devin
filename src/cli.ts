#!/usr/bin/env node
import type { CliErrorRendering } from './cli/cli-error-rendering';
import { renderCliError } from './cli/render-cli-error';
import { runCli } from './cli/run-cli';
import { writeStreamLine } from './cli/write-stream-line';

runCli()
  .then((code: number): void => {
    process.exitCode = code;
  })
  .catch((error: unknown): void => {
    const rendering: CliErrorRendering = renderCliError(
      error,
      process.argv.slice(2).includes('--json'),
    );
    writeStreamLine(process.stderr, rendering.stderrText);
    process.exitCode = rendering.exitCode;
  });
