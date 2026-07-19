import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { DevinStubScript } from './devin-stub-script';

export class DevinStub implements CommandRunner {
  private readonly pendingTurns: CommandResult[];
  private readonly listResponse: CommandResult | null;
  private readonly pendingListResponses: CommandResult[];
  private readonly recorded: CommandInvocation[];

  public constructor(script: DevinStubScript) {
    this.pendingTurns = [...script.turns];
    this.listResponse = script.listResponse;
    this.pendingListResponses = [...(script.listResponses ?? [])];
    this.recorded = [];
  }

  public run(invocation: CommandInvocation): Promise<CommandResult> {
    this.recorded.push(invocation);

    if (invocation.args.includes('list')) {
      const queued: CommandResult | undefined =
        this.pendingListResponses.shift();
      if (queued !== undefined) {
        return Promise.resolve(queued);
      }
      if (this.listResponse === null) {
        return Promise.reject(
          new Error(
            'DevinStub: received a list invocation but no listResponse was scripted',
          ),
        );
      }
      return Promise.resolve(this.listResponse);
    }

    const nextTurn: CommandResult | undefined = this.pendingTurns.shift();
    if (nextTurn === undefined) {
      return Promise.reject(
        new Error(
          `DevinStub: no scripted turn response left for invocation "${invocation.command} ${invocation.args.join(' ')}"`,
        ),
      );
    }
    return Promise.resolve(nextTurn);
  }

  public get invocations(): readonly CommandInvocation[] {
    return this.recorded;
  }
}
