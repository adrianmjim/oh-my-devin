import type { DetectedMoment } from './detected-moment';
import { distillPrinciple } from './distill-principle';
import { looksLikeCode } from './looks-like-code';
import { QUALITY_GATE_THRESHOLD } from './quality-gate-threshold';
import { scoreMoment } from './score-moment';
import { splitSentences } from './split-sentences';

export function detectMoments(text: string): readonly DetectedMoment[] {
  const moments: DetectedMoment[] = [];
  for (const sentence of splitSentences(text)) {
    const score: number = scoreMoment(sentence);
    const principle: string = looksLikeCode(sentence)
      ? ''
      : distillPrinciple(sentence);
    if (score >= QUALITY_GATE_THRESHOLD && principle !== '') {
      moments.push({ principle, score });
    }
  }
  return moments;
}
