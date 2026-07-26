import type { EngineKind } from '../role/engine-kind';
import type { Engine } from './engine';
import { ENGINE_FACTORIES } from './engine-factories';

export function selectEngine(kind: EngineKind): Engine {
  return ENGINE_FACTORIES[kind]();
}
