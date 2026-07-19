import type { RoleDefinition } from '../role/role-definition';

export function buildContractualPreamble(role: RoleDefinition): string {
  return [
    `You are operating under omd's contractual lane as the "${role.name}" role.`,
    `Deliver your result as a single artifact written to "${role.outputArtifact}",`,
    `conforming to the JSON Schema at "${role.outputSchema}".`,
    `Write no file other than that artifact. End your turn once the artifact is complete.`,
  ].join(' ');
}
