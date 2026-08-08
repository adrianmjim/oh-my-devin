export function openSession(options) {
  const id = options.resume === true ? options.resumeId : 'new';
  return { id, label: `session-${id}` };
}
