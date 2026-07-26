import type { EngineKind } from '../role/engine-kind';
import { DevinHeadlessEngine } from './devin-headless-engine';
import type { Engine } from './engine';
import type { EngineFactory } from './engine-factory';

export const ENGINE_FACTORIES: Record<EngineKind, EngineFactory> = {
  devin: (): Engine => new DevinHeadlessEngine(),
};
