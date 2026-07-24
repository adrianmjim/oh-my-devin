import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ArtifactValidation } from '../artifact/artifact-validation';
import { validateArtifact } from '../artifact/validate-artifact';
import { BudgetEnforcer } from '../budget/budget-enforcer';
import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import type { Engine } from '../engine/engine';
import { EngineError } from '../engine/engine-error';
import { selectEngine } from '../engine/select-engine';
import { classifyOutcome } from '../outcome/classify-outcome';
import type { FailureTier } from '../outcome/failure-tier';
import type { RunReport } from '../outcome/run-report';
import { generateRunId } from '../observability/generate-run-id';
import type { RunId } from '../observability/run-id';
import type { RunObserver } from '../observability/run-observer';
import type { SessionBoundary } from '../observability/session-boundary';
import { attemptRepair } from '../repair/attempt-repair';
import type { RoleDefinition } from '../role/role-definition';
import { HeadlessSessionAdapter } from '../session/headless-session-adapter';
import type { SessionTurnResult } from '../session/session-turn-result';
import { detectDenyHit } from './detect-deny-hit';
import type { DenyDetector } from './deny-detector';
import { resolveRunInvocation } from './resolve-run-invocation';
import type { ResolvedRunInvocation } from './resolved-run-invocation';
import type { RunRoleOptions } from './run-role-options';

export async function runRole(options: RunRoleOptions): Promise<RunReport> {
  const detectDeny: DenyDetector = options.detectDeny ?? detectDenyHit;
  const runId: RunId = options.runId ?? generateRunId();
  const recorder: RunObserver | undefined = options.recorder;

  let resolved: ResolvedRunInvocation | undefined = options.resolved;
  if (resolved === undefined) {
    try {
      resolved = await resolveRunInvocation(
        options.workingDirectory,
        options.roleName,
        options.task,
      );
    } catch (error: unknown) {
      recorder?.close();
      throw error;
    }
  }
  const role: RoleDefinition = resolved.role;
  const schemaText: string = resolved.schemaText;
  const bundle: AgentConfigBundle = resolved.bundle;

  const schemaPath: string = join(options.workingDirectory, role.outputSchema);
  const artifactPath: string = join(
    options.workingDirectory,
    role.outputArtifact,
  );

  let bundleDir: string | null = null;
  try {
    await recorder?.append({
      type: 'runLaunched',
      timestamp: options.clock(),
      runId,
      runKind: 'single-role',
      subject: role.name,
      maxTurns: role.maxTurns,
      artifactPath: role.outputArtifact,
    });

    bundleDir = await mkdtemp(join(tmpdir(), 'omd-bundle-'));
    const bundlePath: string = join(bundleDir, 'agent-config.json');
    await writeFile(bundlePath, JSON.stringify(bundle), 'utf8');

    const engine: Engine = selectEngine(role.engine);
    const adapter: HeadlessSessionAdapter = new HeadlessSessionAdapter(
      options.runner,
      engine,
      {
        agentConfigPath: bundlePath,
        model: options.model ?? role.model,
        workingDirectory: options.workingDirectory,
      },
    );
    const budget: BudgetEnforcer = new BudgetEnforcer(
      role.maxTurns,
      role.wallTimeMs,
      options.clock,
    );

    const initial: SessionTurnResult = await adapter.sendTurn(options.task);
    budget.recordTurn();
    await recordTurnCompleted(recorder, options.clock(), budget.turnsUsed - 1);

    let denyRule: string | null = detectDeny(initial);

    if (denyRule === null && initial.exitCode !== 0) {
      throw new EngineError(
        `devin exited with code ${initial.exitCode}: ${initial.stderr.trim() || '(no error output)'}`,
      );
    }

    let repairAttempted: boolean = false;
    let validation: ArtifactValidation = {
      valid: false,
      missing: true,
      errors: [],
    };

    if (denyRule === null) {
      validation = await validateArtifact(artifactPath, schemaPath);
      await recordArtifactValidated(
        recorder,
        options.clock(),
        role,
        validation,
      );
      if (!validation.valid && budget.canProceed()) {
        const repairTurnIndex: number = budget.turnsUsed;
        await recorder?.append({
          type: 'repairAttempted',
          timestamp: options.clock(),
          turnIndex: repairTurnIndex,
        });
        const repaired: SessionTurnResult = await attemptRepair(
          adapter,
          validation,
          schemaText,
        );
        budget.recordTurn();
        repairAttempted = true;
        await recordTurnCompleted(recorder, options.clock(), repairTurnIndex);
        denyRule = detectDeny(repaired);
        if (denyRule === null) {
          validation = await validateArtifact(artifactPath, schemaPath);
          await recordArtifactValidated(
            recorder,
            options.clock(),
            role,
            validation,
          );
        }
      }
    }

    const failureTier: FailureTier | null = classifyOutcome({
      denyHit: denyRule !== null,
      artifactValid: validation.valid,
      repairAttempted,
      budgetExhausted: !budget.canProceed(),
    });

    await recorder?.append({
      type: 'terminalOutcome',
      timestamp: options.clock(),
      succeeded: failureTier === null,
      failureTier,
    });

    return {
      runId,
      role: role.name,
      task: options.task,
      engine: role.engine,
      sessionId: adapter.currentSessionId,
      failureTier,
      turnsUsed: budget.turnsUsed,
      maxTurns: role.maxTurns,
      wallTimeMs: budget.elapsedMs,
      artifactPath: role.outputArtifact,
      artifactValid: validation.valid,
      validationErrors: validation.errors,
      denyRule,
      repairAttempted,
    };
  } catch (error: unknown) {
    await recorder
      ?.append({
        type: 'terminalOutcome',
        timestamp: options.clock(),
        succeeded: false,
        failureTier: null,
      })
      .catch((): void => undefined);
    throw error;
  } finally {
    if (bundleDir !== null) {
      await rm(bundleDir, { recursive: true, force: true });
    }
    recorder?.close();
  }
}

async function recordTurnCompleted(
  recorder: RunObserver | undefined,
  timestamp: number,
  turnIndex: number,
): Promise<void> {
  const boundary: SessionBoundary = turnIndex === 0 ? 'launch' : 'resume';
  await recorder?.append({
    type: 'turnCompleted',
    timestamp,
    turnIndex,
    boundary,
  });
}

async function recordArtifactValidated(
  recorder: RunObserver | undefined,
  timestamp: number,
  role: RoleDefinition,
  validation: ArtifactValidation,
): Promise<void> {
  await recorder?.append({
    type: 'artifactValidated',
    timestamp,
    artifactPath: role.outputArtifact,
    valid: validation.valid,
    missing: validation.missing,
  });
}
