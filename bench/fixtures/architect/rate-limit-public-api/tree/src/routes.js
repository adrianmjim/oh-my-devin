import { authenticate } from './auth.js';
import { searchDocuments } from './search.js';

export function register(app) {
  app.get('/v1/search', async (request, response) => {
    const key = await authenticate(request.headers['x-api-key']);
    if (key === null) {
      response.status(401).json({ error: 'unauthenticated' });
      return;
    }
    const results = await searchDocuments(request.query.q);
    response.json({ results });
  });

  app.get('/v1/documents/:id', async (request, response) => {
    const key = await authenticate(request.headers['x-api-key']);
    if (key === null) {
      response.status(401).json({ error: 'unauthenticated' });
      return;
    }
    response.json({ id: request.params.id });
  });
}
