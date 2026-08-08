import { searchDocuments } from './search.js';

export function register(app) {
  app.get('/v1/search', async (request, response) => {
    const results = await searchDocuments(request.query.q);
    response.json({ results });
  });
}
