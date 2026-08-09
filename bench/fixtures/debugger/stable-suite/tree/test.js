import assert from 'node:assert';
import { total } from './src/total.js';

assert.strictEqual(total([]), 0);
assert.strictEqual(total([{ amount: 2 }, { amount: 3 }]), 5);
assert.strictEqual(total([{ amount: -1 }, { amount: 1 }]), 0);

console.log('ok');
