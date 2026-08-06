import assert from 'node:assert/strict';
import test from 'node:test';
import { slugify } from '../src/slugify.js';

test('lowercases and joins words with a hyphen', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
});

test('drops punctuation and collapses runs of separators', () => {
  assert.equal(slugify('  Hello,   World!!  '), 'hello-world');
});

test('returns an empty string when nothing survives', () => {
  assert.equal(slugify('!!!'), '');
});
