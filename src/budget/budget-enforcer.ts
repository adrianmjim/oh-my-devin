import type { Clock } from './clock';

export class BudgetEnforcer {
  private readonly maxTurns: number;
  private readonly wallTimeMs: number | null;
  private readonly clock: Clock;
  private readonly startedAt: number;
  private turns: number;

  public constructor(
    maxTurns: number,
    wallTimeMs: number | null,
    clock: Clock,
  ) {
    this.maxTurns = maxTurns;
    this.wallTimeMs = wallTimeMs;
    this.clock = clock;
    this.startedAt = clock();
    this.turns = 0;
  }

  public get turnsUsed(): number {
    return this.turns;
  }

  public get elapsedMs(): number {
    return this.clock() - this.startedAt;
  }

  public recordTurn(): void {
    this.turns += 1;
  }

  public hasTurnsRemaining(): boolean {
    return this.turns < this.maxTurns;
  }

  public isWallTimeExhausted(): boolean {
    return this.wallTimeMs !== null && this.elapsedMs >= this.wallTimeMs;
  }

  public canProceed(): boolean {
    return this.hasTurnsRemaining() && !this.isWallTimeExhausted();
  }
}
