import { LAYER_ALLOWLIST } from './layer-allowlist';

export function guardMessage(filePath: string): string {
  return [
    `This session holds a write contract: it orchestrates the work, it does not`,
    `hand-implement it. ${filePath} lies outside the layer paths it may write`,
    `directly (${LAYER_ALLOWLIST.join(', ')}).`,
    `Delegate the change through the omd-delegate skill; run \`omd roles list\``,
    `to see which roles this project ships and pick the one that fits.`,
  ].join(' ');
}
