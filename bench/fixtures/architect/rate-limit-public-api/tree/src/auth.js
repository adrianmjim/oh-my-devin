import { query } from './db.js';

export async function authenticate(apiKey) {
  if (typeof apiKey !== 'string' || apiKey === '') {
    return null;
  }
  const rows = await query('SELECT id, plan FROM api_keys WHERE key = $1', [
    apiKey,
  ]);
  return rows[0] ?? null;
}
