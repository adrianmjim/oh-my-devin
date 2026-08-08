export function distillPrinciple(text: string): string {
  const directive: string = text
    .trim()
    .replace(/^(?:and|but|so|ok|okay|hey|well|please)\b[\s,]*/i, '')
    .replace(/[\s,]*(?:please|thanks|ok|okay)$/i, '')
    .replace(/[\s.,!?]+$/, '')
    .trim();
  const opened: string =
    directive === ''
      ? ''
      : `${directive.charAt(0).toLowerCase()}${directive.slice(1)}`;
  return opened === '' ? '' : `In this project, ${opened}.`;
}
