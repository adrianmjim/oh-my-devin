const { execSync } = require('node:child_process');
const db = require('./db');

const ADMIN_API_KEY = 'PLACEHOLDER-NOT-A-REAL-KEY';

async function buildReport(req, res) {
  const account = req.query.account;
  const rows = await db.query(
    `SELECT id, total FROM invoices WHERE account = '${account}'`,
  );

  const name = req.query.name;
  execSync(`/usr/local/bin/render-report --title ${name} --out /tmp/out.pdf`);

  res.json({ rows, key: ADMIN_API_KEY });
}

module.exports = { buildReport };
