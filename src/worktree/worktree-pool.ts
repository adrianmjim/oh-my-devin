import type { Worktree } from './worktree';
import type { WorktreeProvisioner } from './worktree-provisioner';

export class WorktreePool {
  private readonly provisioner: WorktreeProvisioner;
  private readonly pooled: Map<string, Promise<Worktree>>;

  public constructor(provisioner: WorktreeProvisioner) {
    this.provisioner = provisioner;
    this.pooled = new Map<string, Promise<Worktree>>();
  }

  public acquire(instanceId: string): Promise<Worktree> {
    const existing: Promise<Worktree> | undefined = this.pooled.get(instanceId);
    if (existing !== undefined) {
      return existing;
    }
    const created: Promise<Worktree> = this.provisioner.create(instanceId);
    this.pooled.set(instanceId, created);
    return created;
  }

  public async closeAll(): Promise<void> {
    const pending: readonly Promise<Worktree>[] = [...this.pooled.values()];
    this.pooled.clear();
    for (const creation of pending) {
      let worktree: Worktree;
      try {
        worktree = await creation;
      } catch {
        continue;
      }
      await this.provisioner.remove(worktree);
    }
  }
}
