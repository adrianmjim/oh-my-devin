import type { BenchFixture } from './bench-fixture';
import type { DimensionScore } from './dimension-score';
import { parseArchitectArtifact } from './parse-architect-artifact';
import { parseBenchJson } from './parse-bench-json';
import { parseExecutorArtifact } from './parse-executor-artifact';
import { parseReviewerArtifact } from './parse-reviewer-artifact';
import { scoreArchitect } from './score-architect';
import { scoreExecutor } from './score-executor';
import { scoreReviewer } from './score-reviewer';
import type { TruthDocument } from './truth-document';

export async function scoreFixture(
  fixture: BenchFixture,
  artifactText: string,
  treeDir: string,
  threshold: number,
): Promise<readonly DimensionScore[]> {
  const source: string = `${fixture.role}/${fixture.id} artifact`;
  const parsed: unknown = parseBenchJson(artifactText, source);
  const truth: TruthDocument = fixture.truth;
  let scores: readonly DimensionScore[];
  if (truth.role === 'reviewer') {
    scores = scoreReviewer(
      parseReviewerArtifact(parsed, source),
      truth,
      threshold,
    );
  } else if (truth.role === 'architect') {
    scores = scoreArchitect(
      parseArchitectArtifact(parsed, source),
      truth,
      threshold,
    );
  } else {
    scores = await scoreExecutor(
      parseExecutorArtifact(parsed, source),
      truth,
      treeDir,
      threshold,
    );
  }
  return scores;
}
