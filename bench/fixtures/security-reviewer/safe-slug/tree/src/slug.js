const ALLOWED = /^[a-z0-9-]{1,64}$/;

function normalizeSlug(input) {
  if (typeof input !== 'string') {
    return null;
  }
  const candidate = input.trim().toLowerCase();
  return ALLOWED.test(candidate) ? candidate : null;
}

function slugPath(input) {
  const slug = normalizeSlug(input);
  return slug === null ? null : `/articles/${slug}`;
}

module.exports = { normalizeSlug, slugPath };
