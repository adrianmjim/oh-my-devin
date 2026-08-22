import type { MemoryClass } from './memory-class';

export function isMemoryClass(value: unknown): value is MemoryClass {
  return (
    value === 'profile' ||
    value === 'notepad' ||
    value === 'knowledge' ||
    value === 'rules'
  );
}
