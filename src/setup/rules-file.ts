import { RULES_BODY } from './rules-body';

export const RULES_FILE: string = [
  '# Oh My Devin — in-session layer',
  '',
  'This project runs under the Oh My Devin organizational layer. It has two lanes:',
  ...RULES_BODY,
].join('\n');
