import type { EngineKind } from '../role/engine-kind';
import type { CommandInvocation } from './command-invocation';
import type { Engine } from './engine';
import { EngineError } from './engine-error';
import type { PromptTurn } from './prompt-turn';
import type { SessionListing } from './session-listing';

interface RawSessionListing {
  readonly id: unknown;
  readonly working_directory: unknown;
}

export class DevinHeadlessEngine implements Engine {
  public readonly kind: EngineKind = 'devin';

  public turnInvocation(turn: PromptTurn): CommandInvocation {
    const args: string[] = [];
    if (turn.resumeSessionId !== null) {
      args.push('--resume', turn.resumeSessionId);
    }
    args.push('-p', turn.prompt);
    args.push('--agent-config', turn.agentConfigPath);
    if (turn.model !== null) {
      args.push('--model', turn.model);
    }
    return { command: 'devin', args };
  }

  public listInvocation(): CommandInvocation {
    return { command: 'devin', args: ['list', '--format', 'json'] };
  }

  public parseSessionListing(stdout: string): readonly SessionListing[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      throw new EngineError('devin: session listing is not valid JSON');
    }
    if (!Array.isArray(parsed)) {
      throw new EngineError('devin: session listing is not a JSON array');
    }
    return parsed.map((entry: unknown, index: number): SessionListing => {
      if (entry === null || typeof entry !== 'object') {
        throw new EngineError(
          `devin: session listing entry ${index} is not an object`,
        );
      }
      const raw: RawSessionListing = entry as RawSessionListing;
      if (typeof raw.id !== 'string') {
        throw new EngineError(
          `devin: session listing entry ${index} has no string id`,
        );
      }
      const workingDirectory: string =
        typeof raw.working_directory === 'string' ? raw.working_directory : '';
      return { id: raw.id, workingDirectory };
    });
  }
}
