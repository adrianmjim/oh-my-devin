import { putObject } from './storage.js';

export async function uploadWithRetry(key, body) {
  let delayMs = 100;
  while (true) {
    try {
      return await putObject(key, body);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= 2;
    }
  }
}
