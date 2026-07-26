import type { ParallelInstance } from '../parallel/parallel-instance';
import type { ParallelSettlement } from '../parallel/parallel-settlement';
import { runInParallel } from '../parallel/run-in-parallel';
import type { Worktree } from '../worktree/worktree';
import { WorktreePool } from '../worktree/worktree-pool';
import { DeliberationError } from './deliberation-error';
import { invokeSeat } from './invoke-seat';
import type { SeatInvocation } from './seat-invocation';
import type { SeatInvoker } from './seat-invoker';
import type { SeatPosition } from './seat-position';
import type { SeatSessionDeps } from './seat-session-deps';

export function createSeatInvoker(
  deps: SeatSessionDeps,
  pool: WorktreePool,
): SeatInvoker {
  return async (
    invocations: readonly SeatInvocation[],
  ): Promise<readonly SeatPosition[]> => {
    const worktrees: readonly Worktree[] = await Promise.all(
      invocations.map((invocation: SeatInvocation): Promise<Worktree> =>
        pool.acquire(`seat-${invocation.seat.id}`),
      ),
    );
    const instances: readonly ParallelInstance<SeatPosition>[] =
      invocations.map(
        (
          invocation: SeatInvocation,
          index: number,
        ): ParallelInstance<SeatPosition> => {
          const worktree: Worktree | undefined = worktrees[index];
          if (worktree === undefined) {
            throw new DeliberationError(
              `seat "${invocation.seat.id}" has no acquired worktree`,
            );
          }
          return {
            instanceId: worktree.instanceId,
            workingDirectory: worktree.path,
            run: (): Promise<SeatPosition> =>
              invokeSeat(deps, invocation, worktree),
          };
        },
      );
    const settlements: readonly ParallelSettlement<SeatPosition>[] =
      await runInParallel(instances);
    return settlements.map(
      (settlement: ParallelSettlement<SeatPosition>): SeatPosition => {
        if (settlement.status === 'rejected') {
          throw settlement.reason;
        }
        return settlement.value;
      },
    );
  };
}
