import { query } from './db.js';

export async function searchDocuments(term) {
  const rows = await query(
    'SELECT id, title FROM documents WHERE title ILIKE $1 LIMIT 50',
    [`%${term ?? ''}%`],
  );
  return rows;
}
