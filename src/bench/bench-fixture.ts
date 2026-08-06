import type { BenchRole } from './bench-role';
import type { TruthDocument } from './truth-document';

export interface BenchFixture {
  readonly id: string;
  readonly role: BenchRole;
  readonly clean: boolean;
  readonly dir: string;
  readonly treeDir: string;
  readonly task: string;
  readonly truth: TruthDocument;
  readonly sampleArtifact: string;
}
