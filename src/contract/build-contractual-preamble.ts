import type { RoleDefinition } from '../role/role-definition';

export function buildContractualPreamble(role: RoleDefinition): string {
  const confinement: string =
    role.writeScope === 'worktree'
      ? `Your code changes belong in your working directory: you may write anywhere inside it and nothing outside it.`
      : `Write no file other than that artifact.`;
  return [
    `You are operating under omd's contractual lane as the "${role.name}" role.`,
    `Deliver your result as a single artifact written to "${role.outputArtifact}",`,
    `conforming to the JSON Schema at "${role.outputSchema}".`,
    confinement,
    `End your turn once the artifact is complete.`,
  ].join(' ');
}
