import assert from 'node:assert/strict';
import test from 'node:test';
import { normalize } from '../src/normalize.js';

test('trims and lowercases a string', () => {
  assert.equal(normalize('  Hello '), 'hello');
});

test('returns null for a missing input instead of throwing', () => {
  assert.equal(normalize(null), null);
  assert.equal(normalize(undefined), null);
});
