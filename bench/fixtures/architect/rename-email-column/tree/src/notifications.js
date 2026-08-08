import { query } from './db.js';

export async function listSubscriberEmails() {
  const rows = await query(
    'SELECT email_address FROM users ORDER BY created_at ASC',
  );
  return rows.map((row) => row.email_address);
}
