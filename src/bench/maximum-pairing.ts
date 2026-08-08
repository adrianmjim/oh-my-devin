import type { PairingOption } from './pairing-option';

export function maximumPairing(
  options: readonly PairingOption[],
): readonly PairingOption[] {
  const itemIndexes: readonly number[] = [
    ...new Set<number>(
      options.map((option: PairingOption): number => option.itemIndex),
    ),
  ].sort((left: number, right: number): number => left - right);
  const optionsByPosition: readonly (readonly PairingOption[])[] =
    itemIndexes.map((itemIndex: number): readonly PairingOption[] =>
      options.filter(
        (option: PairingOption): boolean => option.itemIndex === itemIndex,
      ),
    );

  function totalScore(selection: readonly PairingOption[]): number {
    return selection.reduce(
      (sum: number, option: PairingOption): number => sum + option.score,
      0,
    );
  }

  function explore(
    position: number,
    usedCandidateIds: ReadonlySet<string>,
  ): readonly PairingOption[] {
    let selection: readonly PairingOption[] = [];
    if (position < optionsByPosition.length) {
      selection = explore(position + 1, usedCandidateIds);
      for (const option of optionsByPosition[position] ?? []) {
        if (!usedCandidateIds.has(option.candidate.id)) {
          const branch: readonly PairingOption[] = [
            option,
            ...explore(
              position + 1,
              new Set<string>([...usedCandidateIds, option.candidate.id]),
            ),
          ];
          const stronger: boolean =
            branch.length > selection.length ||
            (branch.length === selection.length &&
              totalScore(branch) > totalScore(selection));
          if (stronger) {
            selection = branch;
          }
        }
      }
    }
    return selection;
  }

  return explore(0, new Set<string>());
}
