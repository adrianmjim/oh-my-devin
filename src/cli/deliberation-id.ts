export function deliberationId(question: string): string {
  const slug: string = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${slug.length > 0 ? slug : 'deliberation'}-${Date.now()}`;
}
