import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { ArgumentClusterer } from './argument-clusterer';
import type { ClaimClusters } from './claim-clusters';
import { composeClusteringPrompt } from './compose-clustering-prompt';
import { identityClusters } from './identity-clusters';
import { parseClusters } from './parse-clusters';

export function createEchoClusterer(runner: CommandRunner): ArgumentClusterer {
  return async (claims: readonly string[]): Promise<ClaimClusters> => {
    let result: CommandResult;
    try {
      result = await runner.run({
        command: 'devin',
        args: ['-p', composeClusteringPrompt(claims)],
      });
    } catch {
      return identityClusters(claims);
    }
    if (result.exitCode !== 0) {
      return identityClusters(claims);
    }
    return (
      parseClusters(result.stdout, claims.length) ?? identityClusters(claims)
    );
  };
}
