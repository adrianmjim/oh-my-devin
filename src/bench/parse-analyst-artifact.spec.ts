import { describe, expect, it } from 'vitest';
import type { AnalystArtifact } from './analyst-artifact';
import { BenchFixtureError } from './bench-fixture-error';
import { parseAnalystArtifact } from './parse-analyst-artifact';

const VALID: Record<string, unknown> = {
  acceptanceCriteria: [
    { check: 'A zero size is refused', passesWhen: 'It throws a RangeError' },
  ],
  openQuestions: [
    { question: 'Who owns retention?', whyItMatters: 'It sets the ceiling' },
  ],
  assumptions: [
    { assumption: 'The CLI is installed', validationMethod: 'Run the doctor' },
  ],
  scopeRisks: [{ risk: 'It grows', prevention: 'Cap the fixture count' }],
};

describe('parseAnalystArtifact', () => {
  it('reads each list into pairable text', () => {
    const artifact: AnalystArtifact = parseAnalystArtifact(
      VALID,
      'sample.json',
    );

    expect(artifact.criteria).toHaveLength(1);
    expect(artifact.criteria[0]).toContain('zero size');
    expect(artifact.criteria[0]).toContain('RangeError');
    expect(artifact.questions[0]).toContain('retention');
    expect(artifact.assumptions[0]).toContain('doctor');
    expect(artifact.risks[0]).toContain('Cap the fixture');
  });

  it('reads an analysis whose optional lists are empty', () => {
    const artifact: AnalystArtifact = parseAnalystArtifact(
      {
        acceptanceCriteria: VALID['acceptanceCriteria'],
        openQuestions: [],
        assumptions: [],
        scopeRisks: [],
      },
      'sample.json',
    );

    expect(artifact.questions).toEqual([]);
    expect(artifact.assumptions).toEqual([]);
    expect(artifact.risks).toEqual([]);
  });

  it('rejects a missing acceptance-criteria list', () => {
    expect(() =>
      parseAnalystArtifact({ openQuestions: [] }, 'sample.json'),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a criterion with no pass condition', () => {
    expect(() =>
      parseAnalystArtifact(
        { ...VALID, acceptanceCriteria: [{ check: 'It works' }] },
        'sample.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
