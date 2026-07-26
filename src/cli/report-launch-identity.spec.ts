import { afterEach, describe, expect, it, vi } from 'vitest';
import { reportLaunchIdentity } from './report-launch-identity';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('reportLaunchIdentity', () => {
  it('announces the run on stdout for a text run', () => {
    const out = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((): boolean => true);
    const err = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation((): boolean => true);

    reportLaunchIdentity('omd run', 'run-1', false);

    expect(out).toHaveBeenCalledWith('omd run — launched (run run-1)\n');
    expect(err).not.toHaveBeenCalled();
  });

  it('announces the run on stderr for a json run so stdout stays parseable', () => {
    const out = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((): boolean => true);
    const err = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation((): boolean => true);

    reportLaunchIdentity('omd team run', 'run-2', true);

    expect(err).toHaveBeenCalledWith('omd team run — launched (run run-2)\n');
    expect(out).not.toHaveBeenCalled();
  });
});
