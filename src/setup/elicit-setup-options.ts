import type { InstallLevel } from '../layer/install-level';
import type { LayerComponent } from '../layer/layer-component';
import { createLineReader } from './create-line-reader';
import type { ElicitedSetupOptions } from './elicited-setup-options';
import type { ElicitSetupOptionsInput } from './elicit-setup-options-input';
import type { LineReader } from './line-reader';
import { promptLevel } from './prompt-level';
import { promptScope } from './prompt-scope';

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
