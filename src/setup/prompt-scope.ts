import type { LayerComponent } from '../layer/layer-component';
import type { LineReader } from './line-reader';
import { parseScopeAnswer } from './parse-scope-answer';
import { SCOPE_HINT } from './scope-hint';
import { SCOPE_PROMPT } from './scope-prompt';

export async function promptScope(
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
