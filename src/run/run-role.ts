import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ArtifactValidation } from '../artifact/artifact-validation';
import { validateArtifact } from '../artifact/validate-artifact';
import { BudgetEnforcer } from '../budget/budget-enforcer';
import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import { compileAgentConfigBundle } from '../contract/compile-agent-config-bundle';
import type { Engine } from '../engine/engine';
import { EngineError } from '../engine/engine-error';
import { selectEngine } from '../engine/select-engine';
import { classifyOutcome } from '../outcome/classify-outcome';
import type { FailureTier } from '../outcome/failure-tier';
import type { RunReport } from '../outcome/run-report';
import { attemptRepair } from '../repair/attempt-repair';
import { loadRoleDefinition } from '../role/load-role-definition';
import type { RoleDefinition } from '../role/role-definition';
import { HeadlessSessionAdapter } from '../session/headless-session-adapter';
import type { SessionTurnResult } from '../session/session-turn-result';
import { detectDenyHit } from './detect-deny-hit';
import type { DenyDetector } from './deny-detector';
import type { RunRoleOptions } from './run-role-options';
import { UsageError } from './usage-error';

export async function runRole(options: RunRoleOptions): Promise<RunReport> {
  const detectDeny: DenyDetector = options.detectDeny ?? detectDenyHit;

  if (options.task.trim() === '') {
    throw new UsageError('task must be a non-empty string');
  }

  const role: RoleDefinition = await resolveRole(
    options.workingDirectory,
    options.roleName,
  );

  const schemaPath: string = join(options.workingDirectory, role.outputSchema);
  const artifactPath: string = join(
    options.workingDirectory,
    role.outputArtifact,
  );
  const schemaText: string = await readSchemaText(schemaPath, options.roleName);
  const bundle: AgentConfigBundle = compileBundle(role);

  const bundleDir: string = await mkdtemp(join(tmpdir(), 'omd-bundle-'));
  const bundlePath: string = join(bundleDir, 'agent-config.json');
  await writeFile(bundlePath, JSON.stringify(bundle), 'utf8');

  try {
    const engine: Engine = selectEngine(role.engine);
    const adapter: HeadlessSessionAdapter = new HeadlessSessionAdapter(
      options.runner,
      engine,
      {
        agentConfigPath: bundlePath,
        model: role.model,
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
      if (!validation.valid && budget.canProceed()) {
        const repaired: SessionTurnResult = await attemptRepair(
          adapter,
          validation,
          schemaText,
        );
        budget.recordTurn();
        repairAttempted = true;
        denyRule = detectDeny(repaired);
        if (denyRule === null) {
          validation = await validateArtifact(artifactPath, schemaPath);
        }
      }
    }

    const failureTier: FailureTier | null = classifyOutcome({
      denyHit: denyRule !== null,
      artifactValid: validation.valid,
      repairAttempted,
      budgetExhausted: !budget.canProceed(),
    });

    return {
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
  } finally {
    await rm(bundleDir, { recursive: true, force: true });
  }
}

async function resolveRole(
  workingDirectory: string,
  roleName: string,
): Promise<RoleDefinition> {
  try {
    return await loadRoleDefinition(workingDirectory, roleName);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error
        ? error.message
        : `role "${roleName}" could not be resolved`,
    );
  }
}

async function readSchemaText(
  schemaPath: string,
  roleName: string,
): Promise<string> {
  try {
    return await readFile(schemaPath, 'utf8');
  } catch {
    throw new UsageError(
      `role "${roleName}": output schema not found at ${schemaPath}`,
    );
  }
}

function compileBundle(role: RoleDefinition): AgentConfigBundle {
  try {
    return compileAgentConfigBundle(role);
  } catch (error: unknown) {
    throw new UsageError(
      error instanceof Error ? error.message : 'contract compilation failed',
    );
  }
}
