import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from './council-declaration';
import { CouncilDeclarationError } from './council-declaration-error';
import { parseCouncilDeclaration } from './parse-council-declaration';

const KNOWN: readonly string[] = [
  'architect',
  'product-manager',
  'sre',
  'security-reviewer',
];

const VALID: string = [
  'name: architecture-council',
  'seats:',
  '  - role: architect',
  '    lens: system-boundaries',
  '    proposer: true',
  '  - role: product-manager',
  '    lens: scope-and-user-value',
  '  - role: sre',
  '    lens: operability',
  '    model: sonnet',
  '  - role: security-reviewer',
  '    lens: threats',
  '    contrarian: true',
  'deliberation:',
  '  rounds_cap: 3',
  '  blocking_threshold: high',
  'authority:',
  '  on_consent: proceed',
].join('\n');

describe('parseCouncilDeclaration', () => {
  it('parses a well-formed council', () => {
    const council: CouncilDeclaration = parseCouncilDeclaration(VALID, KNOWN);

    expect(council.name).toBe('architecture-council');
    expect(council.seats.map((s) => s.role)).toEqual([
      'architect',
      'product-manager',
      'sre',
      'security-reviewer',
    ]);
    expect(council.seats[0]?.proposer).toBe(true);
    expect(council.seats[2]?.model).toBe('sonnet');
    expect(council.seats[3]?.contrarian).toBe(true);
    expect(council.tunables.roundsCap).toBe(3);
    expect(council.tunables.blockingThreshold).toBe('high');
    expect(council.tunables.wallTimeMs).toBeNull();
    expect(council.authority).toBe('proceed');
  });

  it('defaults the blocking threshold to high and authority to human', () => {
    const yaml: string = [
      'name: minimal',
      'seats:',
      '  - role: architect',
      '    lens: system-boundaries',
      'deliberation:',
      '  rounds_cap: 2',
    ].join('\n');

    const council: CouncilDeclaration = parseCouncilDeclaration(yaml, KNOWN);
    expect(council.tunables.blockingThreshold).toBe('high');
    expect(council.authority).toBe('human');
    expect(council.seats[0]?.proposer).toBe(false);
    expect(council.seats[0]?.contrarian).toBe(false);
    expect(council.seats[0]?.model).toBeNull();
  });

  it('reads an optional wall-time cap in milliseconds', () => {
    const yaml: string = [
      'name: timed',
      'seats:',
      '  - role: architect',
      '    lens: system-boundaries',
      'deliberation:',
      '  rounds_cap: 2',
      '  wall_time_ms: 60000',
    ].join('\n');

    const council: CouncilDeclaration = parseCouncilDeclaration(yaml, KNOWN);
    expect(council.tunables.wallTimeMs).toBe(60000);
  });

  it('rejects a seat naming an unknown role', () => {
    const yaml: string = [
      'name: t',
      'seats:',
      '  - role: ghost',
      '    lens: whatever',
      'deliberation:',
      '  rounds_cap: 2',
    ].join('\n');
    expect(() => parseCouncilDeclaration(yaml, KNOWN)).toThrow(
      CouncilDeclarationError,
    );
  });

  it('rejects a seat missing its lens', () => {
    const yaml: string = [
      'name: t',
      'seats:',
      '  - role: architect',
      'deliberation:',
      '  rounds_cap: 2',
    ].join('\n');
    expect(() => parseCouncilDeclaration(yaml, KNOWN)).toThrow(/lens/);
  });

  it('rejects an unknown on_consent value', () => {
    const yaml: string = [
      'name: t',
      'seats:',
      '  - role: architect',
      '    lens: system-boundaries',
      'deliberation:',
      '  rounds_cap: 2',
      'authority:',
      '  on_consent: maybe',
    ].join('\n');
    expect(() => parseCouncilDeclaration(yaml, KNOWN)).toThrow(
      CouncilDeclarationError,
    );
  });

  it('rejects a blocking threshold outside the severity scale', () => {
    const yaml: string = [
      'name: t',
      'seats:',
      '  - role: architect',
      '    lens: system-boundaries',
      'deliberation:',
      '  rounds_cap: 2',
      '  blocking_threshold: catastrophic',
    ].join('\n');
    expect(() => parseCouncilDeclaration(yaml, KNOWN)).toThrow(
      CouncilDeclarationError,
    );
  });

  it('rejects a non-positive rounds cap', () => {
    const yaml: string = [
      'name: t',
      'seats:',
      '  - role: architect',
      '    lens: system-boundaries',
      'deliberation:',
      '  rounds_cap: 0',
    ].join('\n');
    expect(() => parseCouncilDeclaration(yaml, KNOWN)).toThrow(
      CouncilDeclarationError,
    );
  });
});
