import type { DebuggerArtifact } from './debugger-artifact';
import type { DebuggerTruthDocument } from './debugger-truth-document';
import type { DebuggerTruthItem } from './debugger-truth-item';
import type { DimensionScore } from './dimension-score';
import { keywordMatchScore } from './keyword-match-score';
import { normalizeBenchText } from './normalize-bench-text';
import { pairTruthItems } from './pair-truth-items';
import type { PairingCandidate } from './pairing-candidate';
import type { PairingResult } from './pairing-result';

export function scoreDebugger(
  artifact: DebuggerArtifact,
  truth: DebuggerTruthDocument,
  threshold: number,
): readonly DimensionScore[] {
  const evidenceCandidates: readonly PairingCandidate[] = artifact.evidence.map(
    (text: string, index: number): PairingCandidate => ({
      id: `evidence-${index}`,
      text,
    }),
  );
  const eliminatedCandidates: readonly PairingCandidate[] =
    artifact.eliminated.map(
      (text: string, index: number): PairingCandidate => ({
        id: `eliminated-${index}`,
        text,
      }),
    );
  const stated: readonly PairingCandidate[] = [
    ...evidenceCandidates,
    ...eliminatedCandidates,
    ...(artifact.rootCause === null
      ? []
      : [
          {
            id: 'root-cause',
            text: `${artifact.rootCause.location} ${artifact.rootCause.text}`,
          },
        ]),
  ];
  const surfaced: PairingResult = pairTruthItems(
    stated,
    truth.causes,
    threshold,
  );
  const evidencePairing: PairingResult = pairTruthItems(
    evidenceCandidates,
    truth.evidence,
    threshold,
  );
  const eliminationPairing: PairingResult = pairTruthItems(
    eliminatedCandidates,
    truth.eliminations,
    threshold,
  );
  const expected: number =
    truth.causes.length + truth.evidence.length + truth.eliminations.length;

  const named: DebuggerTruthItem | undefined =
    artifact.rootCause === null
      ? undefined
      : truth.causes.find(
          (cause: DebuggerTruthItem): boolean =>
            keywordMatchScore(
              `${artifact.rootCause?.location ?? ''} ${artifact.rootCause?.text ?? ''}`,
              cause.keywords,
            ) >= threshold,
        );
  const located: boolean =
    named !== undefined &&
    artifact.rootCause !== null &&
    normalizeBenchText(artifact.rootCause.location).includes(
      normalizeBenchText(named.location).trimEnd(),
    );

  let localization: number;
  if (truth.causes.length === 0) {
    localization = artifact.rootCause === null ? 1 : 0;
  } else {
    localization = (named === undefined ? 0 : 0.5) + (located ? 0.5 : 0);
  }

  let resistance: number;
  if (truth.causes.length === 0) {
    resistance = artifact.rootCause === null ? 1 : 0;
  } else {
    resistance = artifact.rootCause === null || named !== undefined ? 1 : 0;
  }

  return [
    { dimension: 'root-cause-localization', score: localization },
    {
      dimension: 'detection',
      score:
        expected === 0
          ? 1
          : (surfaced.pairs.length +
              evidencePairing.pairs.length +
              eliminationPairing.pairs.length) /
            expected,
    },
    { dimension: 'false-positive-resistance', score: resistance },
  ];
}
