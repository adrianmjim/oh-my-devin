import { join } from 'node:path';
import { ENGINE_LAYER_DIR } from '../layer/engine-layer-dir';

export const ROLES_RELATIVE_DIR: string = join(ENGINE_LAYER_DIR, 'agents');
