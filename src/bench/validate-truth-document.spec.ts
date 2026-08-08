import { describe, expect, it } from 'vitest';
import type { ArchitectTruthDocument } from './architect-truth-document';
import { BenchFixtureError } from './bench-fixture-error';
import type { ExecutorTruthDocument } from './executor-truth-document';
import type { ReviewerTruthDocument } from './reviewer-truth-document';
import { validateTruthDocument } from './validate-truth-document';

const REVIEWER_TRUTH = {
  role: 'reviewer',
  expectedVerdict: 'request_changes',
  defects: [
    {
      id: 'unbounded-loop',
      keywords: ['unbounded', 'loop'],
      severity: 'high',
    },
  ],
};

const ARCHITECT_TRUTH = {
  role: 'architect',
  gaps: [{ id: 'no-migration', keywords: ['migration', 'schema'] }],
};

const EXECUTOR_TRUTH = {
  role: 'executor',
  expectedTests: 'passed',
  criteria: [
    {
      id: 'guard-added',
      keywords: ['guard'],
      path: 'src/parse.js',
      contains: ['if (input == null)'],
    },
  ],
  verification: { command: 'node', args: ['--test'] },
  protectedPaths: ['test/parse.test.js'],
};

describe('validateTruthDocument', () => {
  it('accepts a well-formed reviewer truth document', () => {
    const document: ReviewerTruthDocument = validateTruthDocument(
      REVIEWER_TRUTH,
      'reviewer/null-deref/truth.json',
    ) as ReviewerTruthDocument;

    expect(document.role).toBe('reviewer');
    expect(document.expectedVerdict).toBe('request_changes');
    expect(document.defects[0]?.severity).toBe('high');
  });

  it('accepts a well-formed architect truth document', () => {
    const document: ArchitectTruthDocument = validateTruthDocument(
      ARCHITECT_TRUTH,
      'architect/rename-column/truth.json',
    ) as ArchitectTruthDocument;

    expect(document.gaps.map((gap) => gap.id)).toEqual(['no-migration']);
  });

  it('accepts a well-formed executor truth document', () => {
    const document: ExecutorTruthDocument = validateTruthDocument(
      EXECUTOR_TRUTH,
      'executor/add-guard/truth.json',
    ) as ExecutorTruthDocument;

    expect(document.expectedTests).toBe('passed');
    expect(document.criteria[0]?.path).toBe('src/parse.js');
  });

  it('accepts a clean reviewer fixture with no defects', () => {
    const document: ReviewerTruthDocument = validateTruthDocument(
      { role: 'reviewer', expectedVerdict: 'approve', defects: [] },
      'reviewer/clean/truth.json',
    ) as ReviewerTruthDocument;

    expect(document.defects).toEqual([]);
  });

  it('rejects a missing required field, naming the source and the field', () => {
    expect(() =>
      validateTruthDocument(
        { role: 'reviewer', defects: [] },
        'reviewer/null-deref/truth.json',
      ),
    ).toThrow(BenchFixtureError);
    expect(() =>
      validateTruthDocument(
        { role: 'reviewer', defects: [] },
        'reviewer/null-deref/truth.json',
      ),
    ).toThrow(/reviewer\/null-deref\/truth\.json.*expectedVerdict/);
  });

  it('rejects a truth item with no keywords', () => {
    expect(() =>
      validateTruthDocument(
        {
          role: 'architect',
          gaps: [{ id: 'no-migration', keywords: [] }],
        },
        'architect/rename-column/truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects an unknown role', () => {
    expect(() =>
      validateTruthDocument({ role: 'tester' }, 'tester/x/truth.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a document that is not an object', () => {
    expect(() =>
      validateTruthDocument('reviewer', 'reviewer/x/truth.json'),
    ).toThrow(BenchFixtureError);
  });
});
