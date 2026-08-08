const { slugPath } = require('./slug');
const db = require('./db');

async function readArticle(req, res) {
  const path = slugPath(req.query.slug);
  if (path === null) {
    res.status(400).json({ error: 'invalid slug' });
    return;
  }
  const rows = await db.query('SELECT title, body FROM articles WHERE slug = $1', [
    path.slice('/articles/'.length),
  ]);
  res.json({ article: rows[0] ?? null });
}

module.exports = { readArticle };
