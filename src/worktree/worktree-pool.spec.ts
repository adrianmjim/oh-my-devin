import { describe, expect, it } from 'vitest';
import type { Worktree } from './worktree';
import { WorktreeError } from './worktree-error';
import type { WorktreeProvisioner } from './worktree-provisioner';
import { WorktreePool } from './worktree-pool';

class FakeProvisioner implements WorktreeProvisioner {
  public readonly created: string[] = [];
  public readonly removed: string[] = [];
  public failing: boolean = false;

  public create(instanceId: string): Promise<Worktree> {
    if (this.failing) {
      return Promise.reject(new WorktreeError(`cannot create ${instanceId}`));
    }
    this.created.push(instanceId);
    return Promise.resolve({ instanceId, path: `/wt/${instanceId}` });
  }

  public captureDiff(): Promise<string> {
    return Promise.resolve('');
  }

  public remove(worktree: Worktree): Promise<void> {
    this.removed.push(worktree.instanceId);
    return Promise.resolve();
  }
}

describe('WorktreePool', () => {
  it('creates a worktree on first acquire and reuses it afterwards', async () => {
    const provisioner = new FakeProvisioner();
    const pool = new WorktreePool(provisioner);

    const first: Worktree = await pool.acquire('seat-sre');
    const again: Worktree = await pool.acquire('seat-sre');

    expect(first.path).toBe('/wt/seat-sre');
    expect(again).toEqual(first);
    expect(provisioner.created).toEqual(['seat-sre']);
  });

  it('creates only once under concurrent acquires of the same instance', async () => {
    const provisioner = new FakeProvisioner();
    const pool = new WorktreePool(provisioner);

    const [a, b] = await Promise.all([
      pool.acquire('seat-security'),
      pool.acquire('seat-security'),
    ]);

    expect(a).toEqual(b);
    expect(provisioner.created).toEqual(['seat-security']);
  });

  it('removes every pooled worktree on closeAll and empties the pool', async () => {
    const provisioner = new FakeProvisioner();
    const pool = new WorktreePool(provisioner);
    await pool.acquire('seat-sre');
    await pool.acquire('seat-security');

    await pool.closeAll();
    await pool.acquire('seat-sre');

    expect(provisioner.removed.sort()).toEqual(['seat-security', 'seat-sre']);
    expect(provisioner.created).toEqual([
      'seat-sre',
      'seat-security',
      'seat-sre',
    ]);
  });

  it('skips removal for acquisitions that failed to create', async () => {
    const provisioner = new FakeProvisioner();
    const pool = new WorktreePool(provisioner);
    provisioner.failing = true;
    await expect(pool.acquire('seat-sre')).rejects.toThrow(WorktreeError);
    provisioner.failing = false;

    await pool.closeAll();

    expect(provisioner.removed).toEqual([]);
  });
});
