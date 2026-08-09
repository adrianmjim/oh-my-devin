import type { DimensionScore } from './dimension-score';
import type { DocumentSpecialistArtifact } from './document-specialist-artifact';
import type { DocumentSpecialistTruthDocument } from './document-specialist-truth-document';
import type { DocumentSpecialistTruthItem } from './document-specialist-truth-item';
import type { KeywordPair } from './keyword-pair';
import { normalizeBenchText } from './normalize-bench-text';
import { pairTruthItems } from './pair-truth-items';
import type { PairingCandidate } from './pairing-candidate';
import type { PairingResult } from './pairing-result';
import type { SourcedAnswer } from './sourced-answer';

export function scoreDocumentSpecialist(
  artifact: DocumentSpecialistArtifact,
  truth: DocumentSpecialistTruthDocument,
  threshold: number,
): readonly DimensionScore[] {
  const candidates: readonly PairingCandidate[] = artifact.answers.map(
    (answer: SourcedAnswer, index: number): PairingCandidate => ({
      id: `answer-${index}`,
      text: answer.text,
    }),
  );
  const paired: PairingResult = pairTruthItems(
    candidates,
    truth.answers,
    threshold,
  );
  const attributed: number = paired.pairs.filter(
    (pair: KeywordPair): boolean => {
      const index: number = Number(pair.candidateId.replace('answer-', ''));
      const answer: SourcedAnswer | undefined = artifact.answers[index];
      const expected: DocumentSpecialistTruthItem | undefined =
        truth.answers.find(
          (item: DocumentSpecialistTruthItem): boolean =>
            item.id === pair.itemId,
        );
      return (
        answer !== undefined &&
        expected !== undefined &&
        normalizeBenchText(answer.source).includes(
          normalizeBenchText(expected.source).trimEnd(),
        )
      );
    },
  ).length;

  let detection: number;
  if (truth.answers.length === 0) {
    detection = artifact.answers.length === 0 ? 1 : 0;
  } else {
    detection = paired.pairs.length / truth.answers.length;
  }

  return [
    { dimension: 'detection', score: detection },
    {
      dimension: 'source-attribution-accuracy',
      score:
        truth.answers.length === 0
          ? 1
          : attributed / truth.answers.length,
    },
    {
      dimension: 'false-positive-resistance',
      score:
        candidates.length === 0
          ? 1
          : 1 - paired.unmatchedCandidateIds.length / candidates.length,
    },
  ];
}
