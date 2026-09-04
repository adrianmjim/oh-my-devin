import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { guardAuditPath } from './guard-audit-path';

describe('guardAuditPath', () => {
  it('keeps one project-level audit in the run-record family', () => {
    expect(guardAuditPath('/project')).toBe(
      join('/project', '.omd', 'runs', 'guard-audit.jsonl'),
    );
  });

  it('does not partition the audit by session', () => {
    expect(guardAuditPath('/project')).toBe(guardAuditPath('/project'));
  });
});
