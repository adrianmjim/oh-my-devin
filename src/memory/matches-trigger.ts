export function matchesTrigger(text: string, trigger: string): boolean {
  const term: string = trigger.trim().toLowerCase();
  return (
    term !== '' &&
    new RegExp(
      `(?:^|[^\\p{L}\\p{N}])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[^\\p{L}\\p{N}]|$)`,
      'u',
    ).test(text.toLowerCase())
  );
}
