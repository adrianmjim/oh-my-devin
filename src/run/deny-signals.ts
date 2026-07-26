export const DENY_SIGNALS: readonly RegExp[] = [
  /a tool was rejected by the user/i,
  /rejected by (?:a |the )?deny rule/i,
];
