import { WRITE_TOOLS } from './write-tools';

export function isWriteTool(tool: string | null): boolean {
  return tool !== null && WRITE_TOOLS.includes(tool.toLowerCase());
}
