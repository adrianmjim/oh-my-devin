import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { mergeHooksIntoConfig } from './merge-hooks-into-config';
import type { ResolvedTarget } from './resolved-target';
import type { SetupRefusal, SetupResult } from './setup-result';

async function readIfExists(path: string): Promise<string | null> {
  let content: string | null;
  try {
    content = await readFile(path, 'utf8');
  } catch {
    content = null;
  }
  return content;
}

async function writeFileAt(
  absolutePath: string,
  content: string,
): Promise<void> {
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, 'utf8');
}

export async function writeResolvedTargets(
  targets: readonly ResolvedTarget[],
): Promise<SetupResult> {
  const writtenPaths: string[] = [];
  const refusals: SetupRefusal[] = [];
  for (const target of targets) {
    if (target.kind === 'file') {
      await writeFileAt(target.absolutePath, target.content);
      writtenPaths.push(target.reportPath);
    } else if (target.kind === 'hooks-merge') {
      const existing: string | null = await readIfExists(
        target.configAbsolutePath,
      );
      const merged: string = mergeHooksIntoConfig(existing, target.hooksMap);
      await writeFileAt(target.scriptAbsolutePath, target.scriptContent);
      await writeFileAt(target.configAbsolutePath, merged);
      writtenPaths.push(target.scriptReportPath);
      writtenPaths.push(target.configReportPath);
    } else {
      refusals.push({ component: target.component, reason: target.reason });
    }
  }
  return { writtenPaths, refusals };
}
