import type { InstallLevel } from '../layer/install-level';
import { createLineReader } from './create-line-reader';
import type { LayerComponent } from '../layer/layer-component';
import type { LineReader } from './line-reader';
import { promptLevel } from './prompt-level';
import { promptScope } from './prompt-scope';

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
