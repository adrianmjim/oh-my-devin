export function writeStreamLine(
  stream: NodeJS.WriteStream,
  text: string,
): void {
  stream.write(text.endsWith('\n') ? text : `${text}\n`);
}
