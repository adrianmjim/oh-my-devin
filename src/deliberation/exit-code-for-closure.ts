import type { ClosureState } from './closure-state';

export function exitCodeForClosure(closure: ClosureState): number {
  switch (closure) {
    case 'passed':
      return 0;
    case 'blocked':
      return 5;
    case 'bankrupt':
      return 6;
  }
}
