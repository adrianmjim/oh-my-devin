import { describe, expect, it } from 'vitest';
import { jsonDocumentMarker } from './json-document-marker';

describe('jsonDocumentMarker', () => {
  it('reads the marker attributes of a matching region comment', () => {
    expect(
      jsonDocumentMarker(
        { $comment: 'omd:region id=hooks version=1.2.3 digest=sha256:abc' },
        'hooks',
      ),
    ).toEqual({ id: 'hooks', version: '1.2.3', digest: 'sha256:abc' });
  });

  it('is null when the comment marks another region', () => {
    expect(
      jsonDocumentMarker(
        { $comment: 'omd:region id=other version=1 digest=d' },
        'hooks',
      ),
    ).toBeNull();
  });

  it('is null when the document carries no region comment', () => {
    expect(jsonDocumentMarker({}, 'hooks')).toBeNull();
    expect(
      jsonDocumentMarker({ $comment: 'hand written' }, 'hooks'),
    ).toBeNull();
  });

  it('is null when the comment is not a string', () => {
    expect(jsonDocumentMarker({ $comment: 7 }, 'hooks')).toBeNull();
  });
});
