import { parse as parseYaml } from 'yaml';
import type { ContextPolicy } from './context-policy';
import { isContextPolicy } from './context-policy';
import type { EngineKind } from './engine-kind';
import { isEngineKind } from './engine-kind';
import type { RoleDefinition } from './role-definition';
import { RoleDefinitionError } from './role-definition-error';
import type { RolePermissions } from './role-permissions';

const FRONTMATTER_PATTERN: RegExp =
  /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const DURATION_PATTERN: RegExp = /^(\d+)(ms|s|m|h)?$/;
const DURATION_UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60000,
  h: 3600000,
};

export function parseRoleDefinition(
  agentMarkdown: string,
  roleName: string,
): RoleDefinition {
  const match: RegExpExecArray | null = FRONTMATTER_PATTERN.exec(
    agentMarkdown.trimStart(),
  );
  if (match === null) {
    throw new RoleDefinitionError(
      `role "${roleName}": AGENT.md has no YAML frontmatter`,
    );
  }

  const frontmatterText: string = match[1] ?? '';
  const body: string = match[2] ?? '';

  const parsed: unknown = parseYaml(frontmatterText);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new RoleDefinitionError(
      `role "${roleName}": frontmatter must be a mapping`,
    );
  }
  const fields: Record<string, unknown> = parsed as Record<string, unknown>;

  const fail = (message: string): never => {
    throw new RoleDefinitionError(`role "${roleName}": ${message}`);
  };

  const requireString = (value: unknown, field: string): string => {
    if (typeof value !== 'string' || value.length === 0) {
      return fail(`"${field}" must be a non-empty string`);
    }
    return value;
  };

  const optionalString = (value: unknown, field: string): string | null => {
    if (value === undefined || value === null) {
      return null;
    }
    if (typeof value !== 'string' || value.length === 0) {
      return fail(`"${field}" must be a non-empty string when present`);
    }
    return value;
  };

  const optionalStringArray = (
    value: unknown,
    field: string,
  ): readonly string[] => {
    if (value === undefined || value === null) {
      return [];
    }
    if (!Array.isArray(value)) {
      return fail(`"${field}" must be a list of strings`);
    }
    return value.map((item: unknown, index: number): string => {
      if (typeof item !== 'string') {
        return fail(`"${field}[${index}]" must be a string`);
      }
      return item;
    });
  };

  const requirePositiveInt = (value: unknown, field: string): number => {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
      return fail(`"${field}" must be a positive integer`);
    }
    return value;
  };

  const parseWallTimeMs = (value: unknown): number | null => {
    if (value === undefined || value === null) {
      return null;
    }
    if (typeof value === 'number') {
      if (!Number.isInteger(value) || value < 0) {
        return fail(
          `"omd-wall-time" must be a non-negative integer number of seconds`,
        );
      }
      return value * 1000;
    }
    if (typeof value === 'string') {
      const durationMatch: RegExpExecArray | null = DURATION_PATTERN.exec(
        value.trim(),
      );
      if (durationMatch === null) {
        return fail(`"omd-wall-time" is not a valid duration: "${value}"`);
      }
      const amount: number = Number.parseInt(durationMatch[1] ?? '0', 10);
      const unit: string = durationMatch[2] ?? 's';
      const factor: number | undefined = DURATION_UNIT_MS[unit];
      if (factor === undefined) {
        return fail(`"omd-wall-time" has an unknown unit: "${unit}"`);
      }
      return amount * factor;
    }
    return fail(`"omd-wall-time" must be a string or number`);
  };

  const parsePermissions = (value: unknown): RolePermissions => {
    if (value === undefined || value === null) {
      return { allow: [], deny: [], ask: [] };
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      return fail(`"permissions" must be a mapping`);
    }
    const perms: Record<string, unknown> = value as Record<string, unknown>;
    return {
      allow: optionalStringArray(perms['allow'], 'permissions.allow'),
      deny: optionalStringArray(perms['deny'], 'permissions.deny'),
      ask: optionalStringArray(perms['ask'], 'permissions.ask'),
    };
  };

  const engineValue: unknown = fields['engine'];
  const engine: EngineKind =
    engineValue === undefined || engineValue === null
      ? 'devin'
      : isEngineKind(engineValue)
        ? engineValue
        : fail(`unsupported "engine": ${JSON.stringify(engineValue)}`);

  const contextValue: unknown = fields['omd-context'];
  const contextPolicy: ContextPolicy =
    contextValue === undefined || contextValue === null
      ? 'isolated'
      : isContextPolicy(contextValue)
        ? contextValue
        : fail(`unsupported "omd-context": ${JSON.stringify(contextValue)}`);

  const toolsValue: unknown = fields['allowed-tools'] ?? fields['tools'];

  return {
    name: roleName,
    engine,
    agentType: optionalString(fields['agent_type'], 'agent_type'),
    model: optionalString(fields['model'], 'model'),
    tools: optionalStringArray(toolsValue, 'allowed-tools'),
    permissions: parsePermissions(fields['permissions']),
    outputArtifact: requireString(fields['omd-output'], 'omd-output'),
    outputSchema: requireString(fields['omd-schema'], 'omd-schema'),
    maxTurns: requirePositiveInt(fields['omd-max-turns'], 'omd-max-turns'),
    contextPolicy,
    wallTimeMs: parseWallTimeMs(fields['omd-wall-time']),
    promptBody: body.trim(),
  };
}
