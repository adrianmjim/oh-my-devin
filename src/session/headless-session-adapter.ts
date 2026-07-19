import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { Engine } from '../engine/engine';
import type { PromptTurn } from '../engine/prompt-turn';
import type { SessionListing } from '../engine/session-listing';
import type { SessionConfig } from './session-config';
import type { SessionTurnResult } from './session-turn-result';
import type { TurnSender } from './turn-sender';

export class HeadlessSessionAdapter implements TurnSender {
  private readonly runner: CommandRunner;
  private readonly engine: Engine;
  private readonly config: SessionConfig;
  private sessionId: string | null;

  public constructor(
    runner: CommandRunner,
    engine: Engine,
    config: SessionConfig,
  ) {
    this.runner = runner;
    this.engine = engine;
    this.config = config;
    this.sessionId = null;
  }

  public get currentSessionId(): string | null {
    return this.sessionId;
  }

  public async sendTurn(prompt: string): Promise<SessionTurnResult> {
    const turn: PromptTurn = {
      prompt,
      agentConfigPath: this.config.agentConfigPath,
      model: this.config.model,
      resumeSessionId: this.sessionId,
    };
    const invocation: CommandInvocation = this.engine.turnInvocation(turn);
    const result: CommandResult = await this.runner.run(invocation);

    const sessionId: string | null =
      this.sessionId ?? (await this.discoverSessionId());
    this.sessionId = sessionId;

    return {
      sessionId,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    };
  }

  private async discoverSessionId(): Promise<string | null> {
    const invocation: CommandInvocation = this.engine.listInvocation();
    const result: CommandResult = await this.runner.run(invocation);
    const sessions: readonly SessionListing[] = this.engine.parseSessionListing(
      result.stdout,
    );
    const match: SessionListing | undefined = sessions.find(
      (session: SessionListing): boolean =>
        session.workingDirectory === this.config.workingDirectory,
    );
    return match?.id ?? null;
  }
}
