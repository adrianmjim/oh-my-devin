import { delayFor, MAX_ATTEMPTS } from './backoff.js';
import { recordDeadLetter } from './dead-letters.js';

export async function send(event, transport) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const result = await transport.post(event);
    if (result.ok) {
      return result;
    }
    if (result.status >= 400 && result.status < 500) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, delayFor(attempt)));
  }
  await recordDeadLetter(event);
  return { ok: false };
}
