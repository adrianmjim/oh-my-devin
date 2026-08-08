export async function putObject(key, body) {
  const response = await fetch(`https://objects.example.com/${key}`, {
    method: 'PUT',
    body,
  });
  if (!response.ok) {
    throw new Error(`PUT ${key} failed with ${response.status}`);
  }
  return { key, etag: response.headers.get('etag') };
}
