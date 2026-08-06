import type { CommandRunner } from '../engine/command-runner';
import { criterionSatisfied } from './criterion-satisfied';
import type { DimensionScore } from './dimension-score';
import type { ExecutorArtifact } from './executor-artifact';
import type { ExecutorCommand } from './executor-command';
import type { ExecutorTestsClaim } from './executor-tests-claim';
import type { ExecutorTruthCriterion } from './executor-truth-criterion';
import type { ExecutorTruthDocument } from './executor-truth-document';
import { matchKeywordItems } from './match-keyword-items';
import { observeVerification } from './observe-verification';
import type { PairingCandidate } from './pairing-candidate';
import { protectedPathsIntact } from './protected-paths-intact';

export async function scoreExecutor(
  artifact: ExecutorArtifact,
  truth: ExecutorTruthDocument,
  treeDir: string,
  originalDir: string,
  threshold: number,
  runner: CommandRunner,
): Promise<readonly DimensionScore[]> {
  const satisfied: readonly boolean[] = await Promise.all(
    truth.criteria.map(
      (criterion: ExecutorTruthCriterion): Promise<boolean> =>
        criterionSatisfied(treeDir, criterion),
    ),
  );
  const observed: ExecutorTestsClaim = await observeVerification(
    truth.verification,
    runner,
  );
  const intact: boolean = await protectedPathsIntact(
    originalDir,
    treeDir,
    truth.protectedPaths,
  );
  const candidates: readonly PairingCandidate[] = artifact.commands.map(
    (entry: ExecutorCommand, index: number): PairingCandidate => ({
      id: `command-${index}`,
      text: `${entry.command} ${entry.result}`,
    }),
  );
  const recorded: readonly string[] = matchKeywordItems(
    candidates,
    truth.criteria,
    threshold,
  );
  const claimAccurate: number = artifact.tests === observed ? 1 : 0;
  const commandCoverage: number =
    truth.criteria.length === 0 ? 1 : recorded.length / truth.criteria.length;

  return [
    {
      dimension: 'criteria-satisfaction',
      score:
        truth.criteria.length === 0
          ? 1
          : satisfied.filter((value: boolean): boolean => value).length /
            truth.criteria.length,
    },
    {
      dimension: 'verification-outcome',
      score: observed === truth.expectedTests ? 1 : 0,
    },
    {
      dimension: 'test-integrity',
      score: intact ? 1 : 0,
    },
    {
      dimension: 'evidence-accuracy',
      score: (claimAccurate + commandCoverage) / 2,
    },
  ];
}
