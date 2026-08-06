import { reportVersion } from '../cli/report-version';
import { ProcessCommandRunner } from '../engine/process-command-runner';
import { BENCH_SAVE_ENV } from './bench-save-env';
import { detectEngineVersion } from './detect-engine-version';
import type { FinalizeRoleBenchOptions } from './finalize-role-bench-options';
import { roleAgentMd } from './role-agent-md';
import { rolePromptDigest } from './role-prompt-digest';
import { saveBaseline } from './save-baseline';
import { writeBenchResults } from './write-bench-results';

export async function finalizeRoleBench(
  options: FinalizeRoleBenchOptions,
): Promise<string> {
  const resultsPath: string = await writeBenchResults(
    options.score,
    options.resultsDir,
  );
  const requested: boolean =
    options.mode === 'real' && options.env[BENCH_SAVE_ENV] === '1';
  if (requested) {
    await saveBaseline({
      score: options.score,
      promptDigest: rolePromptDigest(roleAgentMd(options.score.role)),
      omdVersion: await reportVersion(),
      engineVersion: await detectEngineVersion(
        new ProcessCommandRunner(process.cwd()),
      ),
      baselinesDir: options.baselinesDir,
      requested: true,
    });
  }
  return resultsPath;
}
