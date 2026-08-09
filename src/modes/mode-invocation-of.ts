import { basename } from 'node:path';
import { SHELL_OPERATOR_PATTERN } from './shell-operator-pattern';

export function modeInvocationOf(command: string): string | null {
  const tokens: readonly string[] = command.trim().split(/\s+/u);
  const binary: number = tokens.findIndex(
    (token: string): boolean => basename(token) === 'omd',
  );
  const tail: string = binary === -1 ? '' : tokens.slice(binary + 1).join(' ');
  const ends: number = tail.search(SHELL_OPERATOR_PATTERN);
  const invoked: readonly string[] = (ends === -1 ? tail : tail.slice(0, ends))
    .trim()
    .split(/\s+/u)
    .filter((token: string): boolean => token !== '');
  return invoked[0] === 'mode' ? invoked.join(' ') : null;
}
