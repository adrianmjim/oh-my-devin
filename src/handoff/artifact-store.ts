import type { HandoffArtifactName } from './handoff-artifact-name';

export class ArtifactStore {
  private readonly artifacts: Map<HandoffArtifactName, string>;

  public constructor() {
    this.artifacts = new Map<HandoffArtifactName, string>();
  }

  public set(name: HandoffArtifactName, content: string): void {
    this.artifacts.set(name, content);
  }

  public get(name: HandoffArtifactName): string | undefined {
    return this.artifacts.get(name);
  }

  public has(name: HandoffArtifactName): boolean {
    return this.artifacts.has(name);
  }
}
