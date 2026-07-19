export const RULES_FILE: string = [
  '# Oh My Devin — in-session layer',
  '',
  'This project runs under the Oh My Devin organizational layer. It has two lanes:',
  '',
  '- **Conversational lane** — roles run as native Devin subagents under soft',
  '  enforcement plus CLI-enforced tool contracts.',
  '- **Contractual lane** — entered when the delegation skill invokes',
  '  `omd run <role> "<task>"` for work needing a validated artifact, budgets,',
  '  and failure semantics.',
  '',
  '## Installed roles',
  '',
  '- `reviewer` — assesses a diff and writes a structured `review.json`.',
  '',
  '## Delegation',
  '',
  'Ask to delegate work to a named role and the `omd-delegate` skill runs',
  '`omd run` for you.',
  '',
].join('\n');

export const EXAMPLE_ROLE_AGENT_MD: string = [
  '---',
  'name: reviewer',
  'description: Reviews a diff and writes a structured verdict.',
  'allowed-tools:',
  '  - read',
  '  - grep',
  '  - create',
  '  - edit',
  'permissions:',
  '  allow:',
  '    - "Write(review.json)"',
  'omd-output: review.json',
  'omd-schema: .devin/schemas/review.schema.json',
  'omd-max-turns: 6',
  'omd-context: isolated',
  '---',
  '',
  'You are the reviewer. Assess the diff against the requirements and write',
  'your verdict to review.json.',
  '',
].join('\n');

export const EXAMPLE_ROLE_SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['verdict'],
    properties: {
      verdict: { type: 'string', enum: ['approve', 'request_changes'] },
      notes: { type: 'string' },
    },
    additionalProperties: false,
  },
  null,
  2,
)}\n`;

export const DELEGATION_SKILL: string = [
  '---',
  'name: omd-delegate',
  'description: Delegate a task to a named omd role via the contractual lane.',
  'triggers:',
  '  - model',
  'allowed-tools:',
  '  - exec',
  'permissions:',
  '  allow:',
  '    - "Exec(omd)"',
  '---',
  '',
  'When the user asks to delegate work to a named role, run:',
  '',
  '    omd run <role> "<task>"',
  '',
  'This enters the contractual lane: the role produces a validated artifact under',
  'its budget, and omd reports the outcome. Do not attempt the work in the',
  'conversational lane when hard enforcement is requested.',
  '',
].join('\n');

export const HOOKS_MAP: string = `${JSON.stringify(
  {
    SessionStart: [
      {
        hooks: [
          {
            type: 'command',
            command: 'node .devin/hooks/omd-mode.mjs session-start',
          },
        ],
      },
    ],
    UserPromptSubmit: [
      {
        hooks: [
          {
            type: 'command',
            command: 'node .devin/hooks/omd-mode.mjs user-prompt',
          },
        ],
      },
    ],
    Stop: [
      {
        hooks: [
          { type: 'command', command: 'node .devin/hooks/omd-mode.mjs stop' },
        ],
      },
    ],
  },
  null,
  2,
)}\n`;

export const HOOK_SCRIPT: string = [
  '#!/usr/bin/env node',
  "const phase = process.argv[2] ?? '';",
  "let raw = '';",
  "process.stdin.on('data', (chunk) => { raw += chunk; });",
  "process.stdin.on('end', () => {",
  "  if (phase === 'stop') {",
  "    process.stdout.write(JSON.stringify({ decision: 'approve', hookSpecificOutput: { decision: 'approve' } }));",
  '    return;',
  '  }',
  "  process.stdout.write(JSON.stringify({ hookSpecificOutput: { additionalContext: 'Oh My Devin layer active.' } }));",
  '});',
  '',
].join('\n');
