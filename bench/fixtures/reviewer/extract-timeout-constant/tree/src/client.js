const REQUEST_TIMEOUT_MS = 5000;

export async function getJson(url) {
  return await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

export async function postJson(url, body) {
  return await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}
