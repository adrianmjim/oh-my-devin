import { criterionSatisfied } from './criterion-satisfied';
import type { DimensionScore } from './dimension-score';
import type { ExecutorArtifact } from './executor-artifact';
import type { ExecutorCommand } from './executor-command';
import type { ExecutorTruthCriterion } from './executor-truth-criterion';
import type { ExecutorTruthDocument } from './executor-truth-document';
import { matchKeywordItems } from './match-keyword-items';
import type { PairingCandidate } from './pairing-candidate';

export async function scoreExecutor(
  artifact: ExecutorArtifact,
  truth: ExecutorTruthDocument,
  treeDir: string,
  threshold: number,
): Promise<readonly DimensionScore[]> {
  const satisfied: readonly boolean[] = await Promise.all(
    truth.criteria.map(
      (criterion: ExecutorTruthCriterion): Promise<boolean> =>
        criterionSatisfied(treeDir, criterion),
    ),
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
  const testsAccurate: number = artifact.tests === truth.expectedTests ? 1 : 0;
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
      dimension: 'evidence-accuracy',
      score: (testsAccurate + commandCoverage) / 2,
    },
  ];
}
