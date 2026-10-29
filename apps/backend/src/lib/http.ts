export function safeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Неизвестная ошибка";
  return error.message
    .replace(/sk-[A-Za-z0-9_-]+/g, "[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .slice(0, 500);
}
