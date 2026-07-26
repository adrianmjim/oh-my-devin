export function renderClarificationQuestions(
  questions: readonly string[],
): string {
  return questions
    .map((question: string): string => `- ${question}`)
    .join('\n');
}
