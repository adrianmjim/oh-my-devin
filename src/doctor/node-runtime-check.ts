import type { CheckResult } from './check-result';
import { MIN_NODE_MAJOR } from './min-node-major';
import { MIN_NODE_MINOR } from './min-node-minor';

export function nodeRuntimeCheck(nodeVersion: string): CheckResult {
  const parts: readonly string[] = nodeVersion.split('.');
  const major: number = Number.parseInt(parts[0] ?? '', 10);
  const parsedMinor: number = Number.parseInt(parts[1] ?? '', 10);
  const minor: number = Number.isNaN(parsedMinor) ? 0 : parsedMinor;
  const belowFloor: boolean =
    major < MIN_NODE_MAJOR ||
    (major === MIN_NODE_MAJOR && minor < MIN_NODE_MINOR);
  if (Number.isNaN(major) || belowFloor) {
    return {
      name: 'node-runtime',
      outcome: 'fail',
      message: `Node.js ${nodeVersion} is below the required ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}`,
    };
  }
  return {
    name: 'node-runtime',
    outcome: 'pass',
    message: `Node.js ${nodeVersion} satisfies the minimum`,
  };
}
