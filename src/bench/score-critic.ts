import type { CriticArtifact } from './critic-artifact';
import type { CriticCategory } from './critic-category';
import type { CriticFinding } from './critic-finding';
import type { CriticTruthDocument } from './critic-truth-document';
import type { CriticTruthItem } from './critic-truth-item';
import type { DimensionScore } from './dimension-score';
import type { KeywordPair } from './keyword-pair';
import { pairTruthItems } from './pair-truth-items';
import type { PairingCandidate } from './pairing-candidate';
import type { PairingResult } from './pairing-result';

export function scoreCritic(
  artifact: CriticArtifact,
  truth: CriticTruthDocument,
  threshold: number,
): readonly DimensionScore[] {
  const candidates: readonly PairingCandidate[] = artifact.findings.map(
    (finding: CriticFinding, index: number): PairingCandidate => ({
      id: `finding-${index}`,
      text: `${finding.where} ${finding.summary} ${finding.fix}`,
    }),
  );
  const itemsOf = (
    category: CriticCategory,
  ): readonly CriticTruthItem[] =>
    truth.findings.filter(
      (item: CriticTruthItem): boolean => item.category === category,
    );

  const flaws: readonly CriticTruthItem[] = itemsOf('present_flaw');
  const absences: readonly CriticTruthItem[] = itemsOf('missing_element');
  const flawPairing: PairingResult = pairTruthItems(
    candidates,
    flaws,
    threshold,
  );
  const absencePairing: PairingResult = pairTruthItems(
    candidates,
    absences,
    threshold,
  );

  const matched: ReadonlySet<string> = new Set<string>([
    ...flawPairing.pairs.map((pair: KeywordPair): string => pair.candidateId),
    ...absencePairing.pairs.map((pair: KeywordPair): string => pair.candidateId),
  ]);
  const unmatched: number = candidates.filter(
    (candidate: PairingCandidate): boolean => !matched.has(candidate.id),
  ).length;

  return [
    {
      dimension: 'detection',
      score: flaws.length === 0 ? 1 : flawPairing.pairs.length / flaws.length,
    },
    {
      dimension: 'missing-element-coverage',
      score:
        absences.length === 0
          ? 1
          : absencePairing.pairs.length / absences.length,
    },
    {
      dimension: 'false-positive-resistance',
      score: candidates.length === 0 ? 1 : 1 - unmatched / candidates.length,
    },
    {
      dimension: 'verdict-accuracy',
      score: artifact.verdict === truth.expectedVerdict ? 1 : 0,
    },
  ];
}
