const REDACT_LENGTH = 3;

/** Hide the last `REDACT_LENGTH` characters so the ID can be found in the dashboard but not replayed. */
export function redactId(id: string): string {
  if (id.length <= REDACT_LENGTH) {
    return '*'.repeat(id.length);
  }
  return `${id.slice(0, -REDACT_LENGTH)}${'*'.repeat(REDACT_LENGTH)}`;
}
