import assert from 'node:assert';
import { openSession } from './src/session.js';

assert.strictEqual(openSession({ resume: false }).id, 'new');
assert.strictEqual(openSession({ resume: false }).label, 'session-new');

const resumed = openSession({ resume: true, id: 'abc123' });
assert.strictEqual(resumed.id, 'abc123');
assert.strictEqual(resumed.label, 'session-abc123');

console.log('ok');
