import type { CommandRunner } from '../engine/command-runner';
import type { BenchFixture } from './bench-fixture';
import type { DimensionScore } from './dimension-score';
import { parseAnalystArtifact } from './parse-analyst-artifact';
import { parseArchitectArtifact } from './parse-architect-artifact';
import { parseBenchJson } from './parse-bench-json';
import { parseCriticArtifact } from './parse-critic-artifact';
import { parseDebuggerArtifact } from './parse-debugger-artifact';
import { parseDocumentSpecialistArtifact } from './parse-document-specialist-artifact';
import { parseExecutorArtifact } from './parse-executor-artifact';
import { parseExploreArtifact } from './parse-explore-artifact';
import { parseReviewerArtifact } from './parse-reviewer-artifact';
import { parseSecurityReviewerArtifact } from './parse-security-reviewer-artifact';
import { scoreAnalyst } from './score-analyst';
import { scoreArchitect } from './score-architect';
import { scoreCritic } from './score-critic';
import { scoreDebugger } from './score-debugger';
import { scoreDocumentSpecialist } from './score-document-specialist';
import { scoreExecutor } from './score-executor';
import { scoreExplore } from './score-explore';
import { scoreReviewer } from './score-reviewer';
import { scoreSecurityReviewer } from './score-security-reviewer';
import type { TruthDocument } from './truth-document';

export async function scoreFixture(
  fixture: BenchFixture,
  artifactText: string,
  treeDir: string,
  threshold: number,
  runner: CommandRunner,
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
  } else if (truth.role === 'critic') {
    scores = scoreCritic(parseCriticArtifact(parsed, source), truth, threshold);
  } else if (truth.role === 'document-specialist') {
    scores = scoreDocumentSpecialist(
      parseDocumentSpecialistArtifact(parsed, source),
      truth,
      threshold,
    );
  } else if (truth.role === 'explore') {
    scores = scoreExplore(
      parseExploreArtifact(parsed, source),
      truth,
      threshold,
    );
  } else if (truth.role === 'debugger') {
    scores = scoreDebugger(
      parseDebuggerArtifact(parsed, source),
      truth,
      threshold,
    );
  } else if (truth.role === 'security-reviewer') {
    scores = scoreSecurityReviewer(
      parseSecurityReviewerArtifact(parsed, source),
      truth,
      threshold,
    );
  } else if (truth.role === 'analyst') {
    scores = scoreAnalyst(
      parseAnalystArtifact(parsed, source),
      truth,
      threshold,
    );
  } else {
    scores = await scoreExecutor(
      parseExecutorArtifact(parsed, source),
      truth,
      treeDir,
      fixture.treeDir,
      threshold,
      runner,
    );
  }
  return scores;
}
