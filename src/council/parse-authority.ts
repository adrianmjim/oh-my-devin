import type { AuthorityPolicy } from './authority-policy';
import { CouncilDeclarationError } from './council-declaration-error';
import { DEFAULT_AUTHORITY_POLICY } from './default-authority-policy';
import { isAuthorityPolicy } from './is-authority-policy';

export function parseAuthority(value: unknown): AuthorityPolicy {
  if (value === undefined || value === null) {
    return DEFAULT_AUTHORITY_POLICY;
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new CouncilDeclarationError('"authority" must be a mapping');
  }
  const fields: Record<string, unknown> = value as Record<string, unknown>;
  const onConsent: unknown = fields['on_consent'];
  if (onConsent === undefined || onConsent === null) {
    return DEFAULT_AUTHORITY_POLICY;
  }
  if (!isAuthorityPolicy(onConsent)) {
    throw new CouncilDeclarationError(
      '"on_consent" must be either human or proceed',
    );
  }
  return onConsent;
}
