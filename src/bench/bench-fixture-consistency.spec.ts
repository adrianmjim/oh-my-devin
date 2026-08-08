import { describe, expect, it } from 'vitest';
import { ALL_BENCH_ROLES } from './all-bench-roles';
import { BENCH_FIXTURES_DIR } from './bench-fixtures-dir';
import { BenchFixtureError } from './bench-fixture-error';
import type { BenchFixture } from './bench-fixture';
import type { BenchRole } from './bench-role';
import { enumerateFixtures } from './enumerate-fixtures';
import { parseAnalystArtifact } from './parse-analyst-artifact';
import { parseArchitectArtifact } from './parse-architect-artifact';
import { parseBenchJson } from './parse-bench-json';
import { parseCriticArtifact } from './parse-critic-artifact';
import { parseDebuggerArtifact } from './parse-debugger-artifact';
import { parseDocumentSpecialistArtifact } from './parse-document-specialist-artifact';
import { parseExecutorArtifact } from './parse-executor-artifact';
import { parseExploreArtifact } from './parse-explore-artifact';
import { parseReviewerArtifact } from './parse-reviewer-artifact';
import { parseSecurityReviewerArtifact } from './parse-security-reviewer-artifact';
import { roleDimensionWeights } from './role-dimension-weights';
import type { DimensionWeight } from './dimension-weight';
import type { RoleFixtureSet } from './role-fixture-set';
import { validateFixtureManifest } from './validate-fixture-manifest';
import { validateTruthDocument } from './validate-truth-document';

const SETS: readonly RoleFixtureSet[] = await Promise.all(
  ALL_BENCH_ROLES.map(
    (role: BenchRole): Promise<RoleFixtureSet> =>
      enumerateFixtures(role, BENCH_FIXTURES_DIR),
  ),
);

function parseArtifact(fixture: BenchFixture): void {
  const source: string = `${fixture.role}/${fixture.id}/sample.json`;
  const parsed: unknown = parseBenchJson(fixture.sampleArtifact, source);
  const readers: Record<BenchRole, (value: unknown, at: string) => unknown> = {
    reviewer: parseReviewerArtifact,
    architect: parseArchitectArtifact,
    executor: parseExecutorArtifact,
    critic: parseCriticArtifact,
    analyst: parseAnalystArtifact,
    'security-reviewer': parseSecurityReviewerArtifact,
    debugger: parseDebuggerArtifact,
    explore: parseExploreArtifact,
    'document-specialist': parseDocumentSpecialistArtifact,
  };
  readers[fixture.role](parsed, source);
}

function truthItemCount(fixture: BenchFixture): number {
  const truth = fixture.truth;
  let count: number;
  if (truth.role === 'reviewer') {
    count = truth.defects.length;
  } else if (truth.role === 'architect') {
    count = truth.gaps.length;
  } else if (truth.role === 'executor') {
    count = truth.criteria.length;
  } else if (truth.role === 'critic') {
    count = truth.findings.length;
  } else if (truth.role === 'analyst') {
    count = truth.gaps.length;
  } else if (truth.role === 'security-reviewer') {
    count = truth.vulnerabilities.length;
  } else if (truth.role === 'debugger') {
    count = truth.causes.length;
  } else if (truth.role === 'explore') {
    count = truth.files.length;
  } else {
    count = truth.answers.length;
  }
  return count;
}

describe('committed bench fixtures', () => {
  it('loads every role fixture set with its manifest and hypothesis', () => {
    expect(SETS).toHaveLength(ALL_BENCH_ROLES.length);
    for (const set of SETS) {
      expect(
        set.fixtures.length,
        `${set.role} has no fixtures`,
      ).toBeGreaterThan(0);
      expect(set.hypothesis.trim(), set.role).not.toBe('');
    }
  });

  it('validates every committed truth document against its typed shape', () => {
    for (const set of SETS) {
      for (const fixture of set.fixtures) {
        expect(fixture.truth.role, `${set.role}/${fixture.id}`).toBe(set.role);
      }
    }
  });

  it('records a sample artifact each role scorer can read', () => {
    for (const set of SETS) {
      for (const fixture of set.fixtures) {
        expect(() => {
          parseArtifact(fixture);
        }, `${set.role}/${fixture.id}`).not.toThrow();
      }
    }
  });

  it('keeps every clean fixture free of embedded ground-truth items', () => {
    for (const set of SETS) {
      for (const fixture of set.fixtures) {
        const truth = fixture.truth;
        if (fixture.clean && truth.role === 'reviewer') {
          expect(truth.defects, `${set.role}/${fixture.id}`).toEqual([]);
          expect(truth.expectedVerdict).toBe('approve');
        }
        if (fixture.clean && truth.role === 'architect') {
          expect(truth.spurious, `${set.role}/${fixture.id}`).toEqual([]);
        }
        if (fixture.clean && truth.role === 'critic') {
          expect(truth.findings, `${set.role}/${fixture.id}`).toEqual([]);
          expect(truth.expectedVerdict).toBe('approve');
        }
        if (fixture.clean && truth.role === 'security-reviewer') {
          expect(truth.vulnerabilities, `${set.role}/${fixture.id}`).toEqual(
            [],
          );
          expect(truth.expectedVerdict).toBe('approve');
        }
        if (fixture.clean && truth.role === 'analyst') {
          expect(truth.gaps, `${set.role}/${fixture.id}`).toEqual([]);
        }
        if (fixture.clean && truth.role === 'debugger') {
          expect(truth.causes, `${set.role}/${fixture.id}`).toEqual([]);
        }
        if (fixture.clean && truth.role === 'explore') {
          expect(truth.files, `${set.role}/${fixture.id}`).toEqual([]);
          expect(truth.relationships).toEqual([]);
        }
        if (fixture.clean && truth.role === 'document-specialist') {
          expect(truth.answers, `${set.role}/${fixture.id}`).toEqual([]);
        }
      }
    }
  });

  it('gives every flawed fixture at least one item to surface', () => {
    for (const set of SETS) {
      for (const fixture of set.fixtures) {
        if (!fixture.clean) {
          expect(
            truthItemCount(fixture),
            `${set.role}/${fixture.id}`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it('holds every verdict-bearing flawed fixture to a blocking verdict', () => {
    for (const set of SETS) {
      for (const fixture of set.fixtures) {
        const truth = fixture.truth;
        if (
          !fixture.clean &&
          (truth.role === 'reviewer' ||
            truth.role === 'critic' ||
            truth.role === 'security-reviewer')
        ) {
          expect(truth.expectedVerdict, `${set.role}/${fixture.id}`).toBe(
            'request_changes',
          );
        }
      }
    }
  });

  it('gives every false-positive-scored role a clean fixture', () => {
    for (const set of SETS) {
      const scored: boolean = roleDimensionWeights(set.role).some(
        (weight: DimensionWeight): boolean =>
          weight.dimension === 'false-positive-resistance',
      );
      if (scored) {
        expect(
          set.fixtures.some((fixture: BenchFixture): boolean => fixture.clean),
          set.role,
        ).toBe(true);
      }
    }
  });

  it('scores false-positive resistance for every evaluator role', () => {
    for (const role of [
      'critic',
      'analyst',
      'security-reviewer',
      'debugger',
      'explore',
      'document-specialist',
    ] as const) {
      expect(
        roleDimensionWeights(role).map(
          (weight: DimensionWeight): string => weight.dimension,
        ),
        role,
      ).toContain('false-positive-resistance');
    }
  });

  it('rejects a malformed truth document', () => {
    expect(() =>
      validateTruthDocument(
        { role: 'reviewer', expectedVerdict: 'approve' },
        'malformed/truth.json',
      ),
    ).toThrow(BenchFixtureError);
    expect(() =>
      validateTruthDocument(
        {
          role: 'architect',
          gaps: [{ id: 'no-keywords', keywords: [] }],
        },
        'malformed/truth.json',
      ),
    ).toThrow(BenchFixtureError);
    expect(() =>
      validateTruthDocument(
        { role: 'critic', expectedVerdict: 'approve' },
        'malformed/truth.json',
      ),
    ).toThrow(BenchFixtureError);
    expect(() =>
      validateTruthDocument(
        { role: 'explore', files: [{ id: 'no-path' }], relationships: [] },
        'malformed/truth.json',
      ),
    ).toThrow(BenchFixtureError);
  });

  it('rejects a manifest whose hypothesis is empty', () => {
    expect(() =>
      validateFixtureManifest(
        {
          role: 'reviewer',
          hypothesis: '  ',
          fixtures: [{ id: 'a', clean: false }],
        },
        'malformed/manifest.json',
      ),
    ).toThrow(BenchFixtureError);
  });
});
