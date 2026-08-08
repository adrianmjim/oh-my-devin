const store = [];

export async function recordDeadLetter(event) {
  store.push({ event, at: 'recorded' });
}

export function deadLetters() {
  return store.slice();
}
