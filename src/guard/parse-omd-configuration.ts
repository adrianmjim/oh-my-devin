import { parse as parseYaml } from 'yaml';
import { isEnforcementLevel } from './is-enforcement-level';
import type { OmdConfiguration } from './omd-configuration';

export function parseOmdConfiguration(text: string): OmdConfiguration {
  let parsed: unknown;
  try {
    parsed = parseYaml(text);
  } catch {
    parsed = null;
  }
  let configuration: OmdConfiguration = { guard: null };
  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    const guard: unknown = (parsed as Record<string, unknown>)['guard'];
    if (typeof guard === 'object' && guard !== null && !Array.isArray(guard)) {
      const declared: unknown = (guard as Record<string, unknown>)['level'];
      configuration = {
        guard: { level: isEnforcementLevel(declared) ? declared : null },
      };
    }
  }
  return configuration;
}
