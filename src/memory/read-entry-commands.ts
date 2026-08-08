export function readEntryCommands(
  manifestText: string | null,
): readonly string[] {
  if (manifestText === null) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(manifestText);
  } catch {
    return [];
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return [];
  }
  const manifest: Record<string, unknown> = parsed as Record<string, unknown>;
  const scripts: unknown = manifest['scripts'];
  if (
    typeof scripts !== 'object' ||
    scripts === null ||
    Array.isArray(scripts)
  ) {
    return [];
  }
  const declared: unknown = manifest['packageManager'];
  const runner: string =
    typeof declared === 'string' ? (declared.split('@')[0] ?? 'npm') : 'npm';
  return Object.keys(scripts).map(
    (script: string): string => `${runner} run ${script}`,
  );
}
