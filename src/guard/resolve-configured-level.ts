import { DEFAULT_ENFORCEMENT_LEVEL } from './default-enforcement-level';
import type { EnforcementLevel } from './enforcement-level';
import type { OmdConfiguration } from './omd-configuration';
import { projectConfigPath } from './project-config-path';
import { readOmdConfiguration } from './read-omd-configuration';

export async function resolveConfiguredLevel(
  baseDir: string,
  userConfigFile: string,
): Promise<EnforcementLevel> {
  const project: OmdConfiguration | null = await readOmdConfiguration(
    projectConfigPath(baseDir),
  );
  const user: OmdConfiguration | null =
    project?.guard?.level == null
      ? await readOmdConfiguration(userConfigFile)
      : null;
  return (
    project?.guard?.level ?? user?.guard?.level ?? DEFAULT_ENFORCEMENT_LEVEL
  );
}
