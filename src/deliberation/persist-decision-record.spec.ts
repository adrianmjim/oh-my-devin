import { readFile, rm } from 'node:fs/promises';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { DecisionRecord } from './decision-record';
import { persistDecisionRecord } from './persist-decision-record';

const RECORD: DecisionRecord = {
  question: 'should we ship?',
  proposal: 'ship behind a flag',
  proposalSource: 'attached',
  consent: 'passed',
  authorityApplied: 'human',
  supportingArguments: [{ id: 'a1', claim: 'safe', endorsements: 2 }],
  objections: [
    { seat: 'security', domain: 'auth', severity: 'high', concern: 'leak' },
  ],
  assumptions: [],
  reconsiderWhen: [],
  humanDecisionRequired: true,
};

describe('persistDecisionRecord', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-record-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('writes the record as decision.json under .omd/deliberations/<id>/', async () => {
    const path: string = await persistDecisionRecord(dir, 'delib-1', RECORD);

    expect(path).toBe(
      join(dir, '.omd', 'deliberations', 'delib-1', 'decision.json'),
    );
    const written: unknown = JSON.parse(await readFile(path, 'utf8'));
    expect(written).toEqual(RECORD);
  });
});
