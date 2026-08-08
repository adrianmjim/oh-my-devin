export function rememberInvocation(principle: string): string {
  return `omd memory remember "${principle.replace(/"/g, '\\"')}"`;
}
