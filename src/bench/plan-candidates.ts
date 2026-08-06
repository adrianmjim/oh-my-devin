import type { ArchitectArtifact } from './architect-artifact';
import type { ArchitectStep } from './architect-step';
import type { PairingCandidate } from './pairing-candidate';

export function planCandidates(
  artifact: ArchitectArtifact,
): readonly PairingCandidate[] {
  return [
    { id: 'approach', text: artifact.approach },
    ...artifact.steps.map(
      (step: ArchitectStep, index: number): PairingCandidate => ({
        id: `step-${index}`,
        text: `${step.description} ${step.files.join(' ')}`,
      }),
    ),
  ];
}
