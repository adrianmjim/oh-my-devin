import { describe, expect, it } from 'vitest';
import { validateAgainstSchema } from '../artifact/validate-against-schema';
import { EXECUTOR_ROLE_SCHEMA } from './executor-role-schema';

const SCHEMA: Record<string, unknown> = JSON.parse(
  EXECUTOR_ROLE_SCHEMA,
) as Record<string, unknown>;
const PROPERTIES: Record<string, unknown> = (SCHEMA['properties'] ??
  {}) as Record<string, unknown>;
const COMMANDS: Record<string, unknown> = (PROPERTIES['commands'] ??
  {}) as Record<string, unknown>;
const COMMAND: Record<string, unknown> = (COMMANDS['items'] ?? {}) as Record<
  string,
  unknown
>;
const COMMAND_PROPERTIES: Record<string, unknown> = (COMMAND['properties'] ??
  {}) as Record<string, unknown>;

describe('EXECUTOR_ROLE_SCHEMA', () => {
  it('is a draft-07 JSON schema for an object', () => {
    expect(SCHEMA['$schema']).toBe('http://json-schema.org/draft-07/schema#');
    expect(SCHEMA['type']).toBe('object');
  });

  it('requires the tests verdict and the commands behind it', () => {
    expect(SCHEMA['required']).toEqual(['tests', 'commands']);
  });

  it('routes on exactly the two outcomes the pipeline knows', () => {
    expect(PROPERTIES['tests']).toEqual({
      type: 'string',
      enum: ['passed', 'failed'],
    });
  });

  it('requires at least one executed command', () => {
    expect(COMMANDS['type']).toBe('array');
    expect(COMMANDS['minItems']).toBe(1);
  });

  it('requires every command to record what ran and what came back', () => {
    expect(COMMAND['type']).toBe('object');
    expect(COMMAND['required']).toEqual(['command', 'result']);
    for (const field of ['command', 'result']) {
      expect(COMMAND_PROPERTIES[field], field).toEqual({
        type: 'string',
        minLength: 1,
      });
    }
  });

  it('keeps the notes optional', () => {
    expect(PROPERTIES['notes']).toEqual({ type: 'string' });
    expect(SCHEMA['required']).not.toContain('notes');
  });

  it('closes both objects and ends with a newline', () => {
    expect(SCHEMA['additionalProperties']).toBe(false);
    expect(COMMAND['additionalProperties']).toBe(false);
    expect(EXECUTOR_ROLE_SCHEMA.endsWith('\n')).toBe(true);
  });

  it('rejects the evidence that satisfied only the pre-uplift shape', () => {
    expect(validateAgainstSchema({ tests: 'passed' }, SCHEMA)).not.toEqual([]);
    expect(
      validateAgainstSchema({ tests: 'passed', commands: [] }, SCHEMA),
    ).not.toEqual([]);
    expect(
      validateAgainstSchema(
        { tests: 'passed', commands: [{ command: 'pnpm test' }] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('rejects a tests value the pipeline cannot route on', () => {
    expect(
      validateAgainstSchema(
        { tests: 'ok', commands: [{ command: 'c', result: 'r' }] },
        SCHEMA,
      ),
    ).not.toEqual([]);
  });

  it('accepts an honest failing run', () => {
    expect(
      validateAgainstSchema(
        {
          tests: 'failed',
          commands: [{ command: 'pnpm test', result: '1 failed' }],
          notes: 'The duration parser still throws',
        },
        SCHEMA,
      ),
    ).toEqual([]);
  });
});
