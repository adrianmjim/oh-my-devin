export function isInteractiveSession(
  inputIsTty: boolean | undefined,
  outputIsTty: boolean | undefined,
): boolean {
  return inputIsTty === true && outputIsTty === true;
}
