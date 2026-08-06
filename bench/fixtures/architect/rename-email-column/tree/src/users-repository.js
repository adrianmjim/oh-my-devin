import { query } from './db.js';

export async function findUserByEmail(emailAddress) {
  const rows = await query(
    'SELECT id, email_address, created_at FROM users WHERE email_address = $1',
    [emailAddress],
  );
  return rows[0] ?? null;
}

export async function createUser(emailAddress) {
  const rows = await query(
    'INSERT INTO users (email_address) VALUES ($1) RETURNING id, email_address',
    [emailAddress],
  );
  return rows[0];
}
