import type { MergeOutcome } from '../ownership/merge-outcome';
import { parseJsonObject } from '../ownership/parse-json-object';
import type { HookRegistryMerge } from './hook-registry-merge';
import { mergeHookDocument } from './merge-hook-document';
import { UNREADABLE_REGISTRY_REASON } from './unreadable-registry-reason';

export function mergeHookRegistry(input: HookRegistryMerge): MergeOutcome {
  const existing: string | null = input.existing;
  const absent: boolean = existing === null || existing.trim() === '';
  const document: Record<string, unknown> | null = absent
    ? {}
    : parseJsonObject(existing ?? '');
  return document === null
    ? { kind: 'blocked', reason: UNREADABLE_REGISTRY_REASON }
    : mergeHookDocument(input, document, absent);
}
