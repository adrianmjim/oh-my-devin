import { createInterface } from 'node:readline/promises';
import type { Interface } from 'node:readline/promises';
import { formatLayerComponents } from './format-layer-components';
import type { InstallLevel } from './install-level';
import { isInstallLevel } from './install-level';
import type { LayerComponent } from './layer-component';
import { isLayerComponent } from './layer-component';

export interface ElicitSetupOptionsInput {
  readonly input: NodeJS.ReadableStream;
  readonly output: NodeJS.WritableStream;
  readonly interactive: boolean;
  readonly level: InstallLevel | null;
  readonly scope: readonly LayerComponent[] | null;
}

export interface ElicitedSetupOptions {
  readonly level: InstallLevel;
  readonly scope: readonly LayerComponent[] | null;
}

interface LineReader {
  next(prompt: string): Promise<string | null>;
  close(): void;
}

type LineResolver = (line: string | null) => void;

const LEVEL_PROMPT: string =
  'Install level? [project/user] (default: project) ';
const SCOPE_PROMPT: string = `Component scope? [full / comma-separated of ${formatLayerComponents(',')}] (default: full) `;
const LEVEL_HINT: string = 'Please answer "project" or "user".\n';
const SCOPE_HINT: string = `Please answer "full" or a comma-separated subset of ${formatLayerComponents(',')}.\n`;

function createLineReader(
  input: NodeJS.ReadableStream,
  output: NodeJS.WritableStream,
): LineReader {
  const reader: Interface = createInterface({ input });
  const buffered: string[] = [];
  const waiting: LineResolver[] = [];
  let ended: boolean = false;

  reader.on('line', (line: string): void => {
    const next: LineResolver | undefined = waiting.shift();
    if (next === undefined) {
      buffered.push(line);
    } else {
      next(line);
    }
  });

  reader.on('close', (): void => {
    ended = true;
    for (const next of waiting.splice(0)) {
      next(null);
    }
  });

  const next = (prompt: string): Promise<string | null> => {
    output.write(prompt);
    const line: string | undefined = buffered.shift();
    if (line !== undefined) {
      return Promise.resolve(line);
    }
    if (ended) {
      return Promise.resolve(null);
    }
    return new Promise<string | null>((resolve: LineResolver): void => {
      waiting.push(resolve);
    });
  };

  return {
    next,
    close: (): void => {
      reader.close();
    },
  };
}

function parseScopeAnswer(
  normalized: string,
): readonly LayerComponent[] | null {
  const parts: readonly string[] = normalized
    .split(',')
    .map((part: string): string => part.trim())
    .filter((part: string): boolean => part.length > 0);
  const components: LayerComponent[] = [];
  let valid: boolean = parts.length > 0;
  for (const part of parts) {
    if (isLayerComponent(part)) {
      components.push(part);
    } else {
      valid = false;
    }
  }
  return valid ? components : null;
}

async function promptLevel(
  reader: LineReader,
  output: NodeJS.WritableStream,
): Promise<InstallLevel> {
  let resolved: InstallLevel | null = null;
  while (resolved === null) {
    const answer: string | null = await reader.next(LEVEL_PROMPT);
    const normalized: string = (answer ?? '').trim().toLowerCase();
    if (answer === null) {
      output.write('\n');
      resolved = 'project';
    } else if (normalized === '') {
      resolved = 'project';
    } else if (isInstallLevel(normalized)) {
      resolved = normalized;
    } else {
      output.write(LEVEL_HINT);
    }
  }
  return resolved;
}

async function promptScope(
  reader: LineReader,
  output: NodeJS.WritableStream,
): Promise<readonly LayerComponent[] | null> {
  let done: boolean = false;
  let resolved: readonly LayerComponent[] | null = null;
  while (!done) {
    const answer: string | null = await reader.next(SCOPE_PROMPT);
    const normalized: string = (answer ?? '').trim().toLowerCase();
    if (answer === null) {
      output.write('\n');
      resolved = null;
      done = true;
    } else if (normalized === '' || normalized === 'full') {
      resolved = null;
      done = true;
    } else {
      const parsed: readonly LayerComponent[] | null =
        parseScopeAnswer(normalized);
      if (parsed === null) {
        output.write(SCOPE_HINT);
      } else {
        resolved = parsed;
        done = true;
      }
    }
  }
  return resolved;
}

export async function elicitSetupOptions(
  input: ElicitSetupOptionsInput,
): Promise<ElicitedSetupOptions> {
  const bothFixed: boolean = input.level !== null && input.scope !== null;
  if (!input.interactive || bothFixed) {
    return { level: input.level ?? 'project', scope: input.scope };
  }
  const reader: LineReader = createLineReader(input.input, input.output);
  let level: InstallLevel;
  let scope: readonly LayerComponent[] | null;
  try {
    level = input.level ?? (await promptLevel(reader, input.output));
    scope = input.scope ?? (await promptScope(reader, input.output));
  } finally {
    reader.close();
  }
  return { level, scope };
}
