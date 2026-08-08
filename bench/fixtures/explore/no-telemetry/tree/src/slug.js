const ALLOWED = /^[a-z0-9-]{1,64}$/;

export function normalizeSlug(input) {
  const candidate = String(input).trim().toLowerCase();
  return ALLOWED.test(candidate) ? candidate : null;
}
