import { CONTRACTUAL_MEMORY_CLASSES } from './contractual-memory-classes';
import { isMemoryClass } from './is-memory-class';
import type { MemoryClass } from './memory-class';

export function isContractualMemoryClass(
  value: unknown,
): value is MemoryClass {
  return isMemoryClass(value) && CONTRACTUAL_MEMORY_CLASSES.includes(value);
}
