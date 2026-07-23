import { execFileSync, spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const INSTALL_SCRIPT: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'install.sh',
);

const NODE_VERSION: string = 'v22.14.0';

interface InstallerRun {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
}

interface Sandbox {
  readonly root: string;
  readonly home: string;
  readonly omdHome: string;
  readonly stubBin: string;
  readonly npmLog: string;
  readonly omdInvokeLog: string;
  readonly omdStubSrc: string;
}

type RunEnv = Record<string, string>;

function platformOs(): string {
  if (process.platform === 'linux') {
    return 'linux';
  }
  if (process.platform === 'darwin') {
    return 'darwin';
  }
  throw new Error(`unsupported test platform: ${process.platform}`);
}

function platformArch(): string {
  if (process.arch === 'x64') {
    return 'x64';
  }
  if (process.arch === 'arm64') {
    return 'arm64';
  }
  throw new Error(`unsupported test arch: ${process.arch}`);
}

function nodeStub(version: string): string {
  return [
    '#!/bin/sh',
    'if [ "$1" = "--version" ]; then',
    `  echo "${version}"`,
    '  exit 0',
    'fi',
    'exit 0',
    '',
  ].join('\n');
}

const NPM_STUB: string = [
  '#!/bin/sh',
  'printf \'%s\\n\' "$*" >> "$NPM_LOG"',
  'prefix=""',
  'pkg=""',
  'while [ $# -gt 0 ]; do',
  '  case "$1" in',
  '    --prefix) prefix="$2"; shift 2 ;;',
  '    install|-g|--global|--force|--no-fund|--no-audit) shift ;;',
  '    *) pkg="$1"; shift ;;',
  '  esac',
  'done',
  'if [ -n "$prefix" ] && [ -n "$pkg" ] && [ -n "${OMD_STUB_SRC:-}" ]; then',
  '  mkdir -p "$prefix/bin"',
  '  cp "$OMD_STUB_SRC" "$prefix/bin/omd"',
  '  chmod +x "$prefix/bin/omd"',
  'fi',
  'exit 0',
  '',
].join('\n');

const OMD_STUB: string = [
  '#!/bin/sh',
  'printf \'%s\\n\' "$*" >> "$OMD_INVOKE_LOG"',
  'if [ "$1" = "--version" ]; then',
  '  echo "0.0.0-installed"',
  'fi',
  'exit 0',
  '',
].join('\n');

const UNAME_UNSUPPORTED_STUB: string = [
  '#!/bin/sh',
  'case "$1" in',
  '  -s) echo "Plan9" ;;',
  '  -m) echo "x86_64" ;;',
  '  *) echo "Plan9" ;;',
  'esac',
  'exit 0',
  '',
].join('\n');

async function writeExec(path: string, body: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, body, 'utf8');
  await chmod(path, 0o755);
}

async function makeSandbox(): Promise<Sandbox> {
  const root: string = await mkdtemp(join(tmpdir(), 'omd-install-'));
  const home: string = join(root, 'home');
  const omdHome: string = join(root, 'omd-home');
  const stubBin: string = join(root, 'stub-bin');
  await mkdir(home, { recursive: true });
  await mkdir(stubBin, { recursive: true });
  const omdStubSrc: string = join(root, 'omd-stub.sh');
  await writeExec(omdStubSrc, OMD_STUB);
  return {
    root,
    home,
    omdHome,
    stubBin,
    npmLog: join(root, 'npm.log'),
    omdInvokeLog: join(root, 'omd.log'),
    omdStubSrc,
  };
}

function baseEnv(sandbox: Sandbox, extra: RunEnv): RunEnv {
  const path: string = `${sandbox.stubBin}${delimiter}${process.env['PATH'] ?? ''}`;
  return {
    ...process.env,
    PATH: path,
    HOME: sandbox.home,
    OMD_HOME: sandbox.omdHome,
    OMD_NODE_VERSION: NODE_VERSION,
    NPM_LOG: sandbox.npmLog,
    OMD_INVOKE_LOG: sandbox.omdInvokeLog,
    OMD_STUB_SRC: sandbox.omdStubSrc,
    SUDO_USER: '',
    SUDO_UID: '',
    ...extra,
  };
}

function runInstaller(env: RunEnv): Promise<InstallerRun> {
  return new Promise<InstallerRun>(
    (
      resolvePromise: (run: InstallerRun) => void,
      reject: (error: Error) => void,
    ): void => {
      const child: ChildProcessWithoutNullStreams = spawn(
        'sh',
        [INSTALL_SCRIPT],
        { env },
      );
      let stdout: string = '';
      let stderr: string = '';
      child.stdout.on('data', (chunk: Buffer): void => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk: Buffer): void => {
        stderr += chunk.toString();
      });
      child.on('error', reject);
      child.on('close', (code: number | null): void => {
        resolvePromise({ stdout, stderr, exitCode: code ?? 1 });
      });
    },
  );
}

async function buildFakeNodeMirror(mirrorDir: string): Promise<string> {
  const tarball: string = `node-${NODE_VERSION}-${platformOs()}-${platformArch()}.tar.gz`;
  const versionDir: string = join(mirrorDir, NODE_VERSION);
  const stage: string = join(mirrorDir, 'stage');
  const inner: string = `node-${NODE_VERSION}-${platformOs()}-${platformArch()}`;
  const innerBin: string = join(stage, inner, 'bin');
  await mkdir(versionDir, { recursive: true });
  await writeExec(join(innerBin, 'node'), nodeStub(NODE_VERSION));
  await writeExec(join(innerBin, 'npm'), NPM_STUB);
  const tarPath: string = join(versionDir, tarball);
  execFileSync('tar', ['-czf', tarPath, '-C', stage, inner]);
  const digest: string = createHash('sha256')
    .update(await readFile(tarPath))
    .digest('hex');
  await writeFile(
    join(versionDir, 'SHASUMS256.txt'),
    `${digest}  ${tarball}\n`,
    'utf8',
  );
  return `file://${mirrorDir}`;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readLog(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return '';
  }
}

describe('install.sh (e2e)', () => {
  let sandbox: Sandbox | null = null;

  afterEach(async () => {
    if (sandbox !== null) {
      await rm(sandbox.root, { recursive: true, force: true });
      sandbox = null;
    }
  });

  it('installs the canonical package with an on-PATH npm and points at omd setup without running it', async () => {
    sandbox = await makeSandbox();
    await writeExec(join(sandbox.stubBin, 'node'), nodeStub(NODE_VERSION));
    await writeExec(join(sandbox.stubBin, 'npm'), NPM_STUB);

    const run: InstallerRun = await runInstaller(baseEnv(sandbox, {}));

    expect(run.exitCode).toBe(0);
    const npmLog: string = await readLog(sandbox.npmLog);
    expect(npmLog).toContain('install');
    expect(npmLog).toContain('oh-my-devin');
    expect(run.stdout).toContain('0.0.0-installed');
    expect(run.stdout).toContain('omd setup');
    const omdLog: string = await readLog(sandbox.omdInvokeLog);
    expect(omdLog).toContain('--version');
    expect(omdLog).not.toContain('setup');
    expect(await exists(join(sandbox.omdHome, 'node'))).toBe(false);
  });

  it('provisions a user-local Node when the present one is below the floor, leaving it untouched', async () => {
    sandbox = await makeSandbox();
    await writeExec(join(sandbox.stubBin, 'node'), nodeStub('v18.20.0'));
    await writeExec(join(sandbox.stubBin, 'npm'), NPM_STUB);
    const mirror: string = await buildFakeNodeMirror(
      join(sandbox.root, 'mirror'),
    );

    const run: InstallerRun = await runInstaller(
      baseEnv(sandbox, { OMD_NODE_MIRROR: mirror }),
    );

    expect(run.exitCode).toBe(0);
    expect(await exists(join(sandbox.omdHome, 'node', 'bin', 'npm'))).toBe(
      true,
    );
    expect(await exists(join(sandbox.omdHome, 'node', 'bin', 'node'))).toBe(
      true,
    );
    expect(await exists(join(sandbox.omdHome, 'bin', 'omd'))).toBe(true);
    expect(run.stdout).toContain('0.0.0-installed');
    const stubNodeVersion: string = execFileSync(
      join(sandbox.stubBin, 'node'),
      ['--version'],
      { encoding: 'utf8' },
    ).trim();
    expect(stubNodeVersion).toBe('v18.20.0');
  });

  it('refuses to run under sudo and installs nothing', async () => {
    sandbox = await makeSandbox();
    await writeExec(join(sandbox.stubBin, 'node'), nodeStub(NODE_VERSION));
    await writeExec(join(sandbox.stubBin, 'npm'), NPM_STUB);

    const run: InstallerRun = await runInstaller(
      baseEnv(sandbox, { SUDO_USER: 'alice', SUDO_UID: '1000' }),
    );

    expect(run.exitCode).not.toBe(0);
    expect(run.stderr.toLowerCase()).toContain('sudo');
    expect(await exists(join(sandbox.omdHome, 'bin', 'omd'))).toBe(false);
    expect(await readLog(sandbox.npmLog)).toBe('');
  });

  it('exits non-zero naming the cause on an unsupported platform, leaving no omd', async () => {
    sandbox = await makeSandbox();
    await writeExec(join(sandbox.stubBin, 'uname'), UNAME_UNSUPPORTED_STUB);

    const run: InstallerRun = await runInstaller(baseEnv(sandbox, {}));

    expect(run.exitCode).not.toBe(0);
    expect(run.stderr.toLowerCase()).toContain('unsupported');
    expect(await exists(join(sandbox.omdHome, 'bin', 'omd'))).toBe(false);
  });

  it('exits non-zero on a failed download, leaving no partially installed omd', async () => {
    sandbox = await makeSandbox();
    await writeExec(join(sandbox.stubBin, 'node'), nodeStub('v18.20.0'));
    await writeExec(join(sandbox.stubBin, 'npm'), NPM_STUB);

    const run: InstallerRun = await runInstaller(
      baseEnv(sandbox, {
        OMD_NODE_MIRROR: `file://${join(sandbox.root, 'no-such-mirror')}`,
      }),
    );

    expect(run.exitCode).not.toBe(0);
    expect(run.stderr.toLowerCase()).toContain('download');
    expect(await exists(join(sandbox.omdHome, 'bin', 'omd'))).toBe(false);
  });
});
