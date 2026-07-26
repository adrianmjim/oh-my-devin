import { RULES_BODY } from './rules-body';

export const USER_RULES_FILE: string = [
  '# Oh My Devin — in-session layer',
  '',
  'Every Devin session started by this user runs under the Oh My Devin',
  'organizational layer. It has two lanes:',
  ...RULES_BODY,
].join('\n');
