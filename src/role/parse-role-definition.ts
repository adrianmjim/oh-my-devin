import { parse as parseYaml } from 'yaml';
import { isMemoryClass } from '../memory/is-memory-class';
import type { MemoryClass } from '../memory/memory-class';
import { withoutRegionMarkers } from '../ownership/without-region-markers';
import type { ContextPolicy } from './context-policy';
import { DURATION_PATTERN } from './duration-pattern';
import { DURATION_UNIT_MS } from './duration-unit-ms';
import { FRONTMATTER_PATTERN } from './frontmatter-pattern';
import { isContextPolicy } from './is-context-policy';
import type { EngineKind } from './engine-kind';
import { isEngineKind } from './is-engine-kind';
import { isRepoRelativePath } from './is-repo-relative-path';
import { isWriteScope } from './is-write-scope';
import type { RoleDefinition } from './role-definition';
import { RoleDefinitionError } from './role-definition-error';
import type { RolePermissions } from './role-permissions';
import type { WriteScope } from './write-scope';

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

  const writeScopeValue: unknown = fields['omd-write-scope'];
  const writeScope: WriteScope =
    writeScopeValue === undefined || writeScopeValue === null
      ? 'artifact'
      : isWriteScope(writeScopeValue)
        ? writeScopeValue
        : fail(
            `unsupported "omd-write-scope": ${JSON.stringify(writeScopeValue)}`,
          );

  const parseMemorySelection = (value: unknown): readonly MemoryClass[] => {
    if (value === undefined || value === null) {
      return [];
    }
    if (!Array.isArray(value)) {
      return fail(`"omd-memory" must be a list of memory classes`);
    }
    return value.map((item: unknown, index: number): MemoryClass => {
      if (!isMemoryClass(item)) {
        return fail(
          `"omd-memory[${index}]" is not a memory class: ${JSON.stringify(item)}`,
        );
      }
      return item;
    });
  };

  const toolsValue: unknown = fields['allowed-tools'] ?? fields['tools'];

  const outputArtifact: string = requireString(
    fields['omd-output'],
    'omd-output',
  );
  if (!isRepoRelativePath(outputArtifact)) {
    fail(
      `"omd-output" must be a relative path inside the working directory: "${outputArtifact}"`,
    );
  }

  return {
    name: roleName,
    engine,
    agentType: optionalString(fields['agent_type'], 'agent_type'),
    model: optionalString(fields['model'], 'model'),
    tools: optionalStringArray(toolsValue, 'allowed-tools'),
    permissions: parsePermissions(fields['permissions']),
    outputArtifact,
    outputSchema: requireString(fields['omd-schema'], 'omd-schema'),
    maxTurns: requirePositiveInt(fields['omd-max-turns'], 'omd-max-turns'),
    contextPolicy,
    wallTimeMs: parseWallTimeMs(fields['omd-wall-time']),
    writeScope,
    memorySelection: parseMemorySelection(fields['omd-memory']),
    promptBody: withoutRegionMarkers(body, 'markdown').trim(),
  };
}
