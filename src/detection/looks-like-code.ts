export function looksLikeCode(text: string): boolean {
  return /[`{}();=<>[\]|]|=>|\.\w+\(|--\w/.test(text);
}
