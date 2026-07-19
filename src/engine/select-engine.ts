import type { EngineKind } from '../role/engine-kind';
import { DevinHeadlessEngine } from './devin-headless-engine';
import type { Engine } from './engine';

type EngineFactory = () => Engine;

const ENGINE_FACTORIES: Record<EngineKind, EngineFactory> = {
  devin: (): Engine => new DevinHeadlessEngine(),
};

export function selectEngine(kind: EngineKind): Engine {
  return ENGINE_FACTORIES[kind]();
}
