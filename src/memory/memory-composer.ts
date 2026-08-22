import type { MemoryClass } from './memory-class';
import type { MemoryDelivery } from './memory-delivery';

export type MemoryComposer = (
  selection: readonly MemoryClass[],
  assignment: string,
) => Promise<MemoryDelivery>;
