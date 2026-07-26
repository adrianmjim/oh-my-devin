import { describe, expect, it } from 'vitest';
import { digestContent } from './digest-content';
import { mergeJsonDocument } from './merge-json-document';
import type { MergeOutcome } from './merge-outcome';
import type { MergeRequest } from './merge-request';
import type { RegionFraming } from './region-framing';

const SCHEMA: string = `${JSON.stringify(
  {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    required: ['verdict'],
  },
  null,
  2,
)}\n`;

const FRAMING: RegionFraming = {
  id: 'schema-review',
  version: '1.2.3',
  style: 'markdown',
  content: SCHEMA,
};

function request(existing: string | null): MergeRequest {
  return { existing, framing: FRAMING };
}

function created(outcome: MergeOutcome): string {
  if (outcome.kind !== 'created') {
    throw new Error(`expected creation, got ${outcome.kind}`);
  }
  return outcome.content;
}

function commentOf(document: string): string {
  const parsed: Record<string, unknown> = JSON.parse(document) as Record<
    string,
    unknown
  >;
  const comment: unknown = parsed['$comment'];
  if (typeof comment !== 'string') {
    throw new Error('expected a $comment marker');
  }
  return comment;
}

describe('mergeJsonDocument', () => {
  it('creates an absent document carrying its marker in the schema comment keyword', () => {
    const document: string = created(mergeJsonDocument(request(null)));

    expect(commentOf(document)).toContain('id=schema-review');
    expect(commentOf(document)).toContain('version=1.2.3');
  });

  it('keeps every key of the document it installs', () => {
    const document: string = created(mergeJsonDocument(request(null)));
    const parsed: Record<string, unknown> = JSON.parse(document) as Record<
      string,
      unknown
    >;

    expect(parsed['type']).toBe('object');
    expect(parsed['required']).toEqual(['verdict']);
  });

  it('digests the document without its own marker', () => {
    const document: string = created(mergeJsonDocument(request(null)));

    expect(commentOf(document)).toContain(`digest=${digestContent(SCHEMA)}`);
  });

  it('reports unchanged when the installed document is already there', () => {
    const document: string = created(mergeJsonDocument(request(null)));

    expect(mergeJsonDocument(request(document))).toEqual({ kind: 'unchanged' });
  });

  it('replaces a pristine document with the newer one', () => {
    const document: string = created(mergeJsonDocument(request(null)));
    const newer: RegionFraming = {
      ...FRAMING,
      content: `${JSON.stringify({ type: 'object', required: ['verdict', 'notes'] }, null, 2)}\n`,
    };

    const outcome: MergeOutcome = mergeJsonDocument({
      existing: document,
      framing: newer,
    });

    expect(outcome.kind).toBe('updated');
  });

  it('preserves a document the user has edited', () => {
    const document: string = created(mergeJsonDocument(request(null)));
    const edited: string = document.replace('"object"', '"array"');

    const outcome: MergeOutcome = mergeJsonDocument(request(edited));

    expect(outcome.kind).toBe('preserved');
  });

  it('conflicts on an existing document that carries no marker', () => {
    const outcome: MergeOutcome = mergeJsonDocument(request(SCHEMA));

    expect(outcome.kind).toBe('conflicted');
  });

  it('conflicts on an existing document that is not valid json', () => {
    const outcome: MergeOutcome = mergeJsonDocument(request('{ not json'));

    expect(outcome.kind).toBe('conflicted');
    expect(outcome.kind === 'conflicted' && outcome.reason.length > 0).toBe(
      true,
    );
  });

  it('conflicts on an existing document that is not a json object', () => {
    const outcome: MergeOutcome = mergeJsonDocument(request('[1, 2, 3]'));

    expect(outcome.kind).toBe('conflicted');
  });

  it('yields a value rather than throwing on arbitrary existing content', () => {
    const inputs: readonly (string | null)[] = [
      null,
      '',
      'null',
      '"text"',
      '{',
    ];

    for (const existing of inputs) {
      expect(() => mergeJsonDocument(request(existing))).not.toThrow();
    }
  });
});
