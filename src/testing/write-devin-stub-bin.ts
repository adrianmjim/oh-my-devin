import { chmod, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const STUB_SCRIPT_ENV: string = 'OMD_STUB_SCRIPT';
export const STUB_LOG_ENV: string = 'OMD_STUB_LOG';

const STUB_SOURCE: string = [
  '#!/usr/bin/env node',
  "'use strict';",
  "const { readFileSync, appendFileSync } = require('node:fs');",
  '',
  `const scriptPath = process.env['${STUB_SCRIPT_ENV}'];`,
  `const logPath = process.env['${STUB_LOG_ENV}'];`,
  'const args = process.argv.slice(2);',
  '',
  'function fail(message) {',
  "  process.stderr.write('devin-stub: ' + message + '\\n');",
  '  process.exit(1);',
  '}',
  '',
  `if (!scriptPath) { fail('${STUB_SCRIPT_ENV} is not set'); }`,
  `if (!logPath) { fail('${STUB_LOG_ENV} is not set'); }`,
  '',
  'let script;',
  'try {',
  "  script = JSON.parse(readFileSync(scriptPath, 'utf8'));",
  '} catch (error) {',
  "  fail('cannot read stub script: ' + String(error));",
  '}',
  '',
  'const turns = Array.isArray(script.turns) ? script.turns : [];',
  'const listResponses = Array.isArray(script.listResponses)',
  '  ? script.listResponses',
  '  : [];',
  'const listResponse =',
  '  script.listResponse === undefined ? null : script.listResponse;',
  '',
  "const isList = args[0] === 'list';",
  '',
  'let priorTurns = 0;',
  'let priorLists = 0;',
  'try {',
  "  const existing = readFileSync(logPath, 'utf8');",
  "  for (const line of existing.split('\\n')) {",
  "    if (line.trim() === '') { continue; }",
  '    const record = JSON.parse(line);',
  "    if (Array.isArray(record.args) && record.args[0] === 'list') {",
  '      priorLists += 1;',
  '    } else {',
  '      priorTurns += 1;',
  '    }',
  '  }',
  '} catch {}',
  '',
  "appendFileSync(logPath, JSON.stringify({ command: 'devin', args }) + '\\n');",
  '',
  'let response;',
  'if (isList) {',
  '  if (priorLists < listResponses.length) {',
  '    response = listResponses[priorLists];',
  '  } else if (listResponse !== null) {',
  '    response = listResponse;',
  '  } else {',
  "    fail('no listResponse was scripted');",
  '  }',
  '} else if (priorTurns < turns.length) {',
  '  response = turns[priorTurns];',
  '} else {',
  "  fail('no scripted turn response left');",
  '}',
  '',
  "process.stdout.write(typeof response.stdout === 'string' ? response.stdout : '');",
  "process.stderr.write(typeof response.stderr === 'string' ? response.stderr : '');",
  "process.exit(typeof response.exitCode === 'number' ? response.exitCode : 0);",
  '',
].join('\n');

export async function writeDevinStubBin(binDir: string): Promise<string> {
  await mkdir(binDir, { recursive: true });
  const binPath: string = join(binDir, 'devin');
  await writeFile(binPath, STUB_SOURCE, 'utf8');
  await chmod(binPath, 0o755);
  return binPath;
}
