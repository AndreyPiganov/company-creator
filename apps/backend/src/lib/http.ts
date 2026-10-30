export function safeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Неизвестная ошибка";
  let message = error.message;
  for (const secret of [process.env.OPENAI_API_KEY, process.env.OPENROUTER_API_KEY]) {
    if (secret) message = message.split(secret).join("[REDACTED]");
  }
  return message
    .replace(/sk-[A-Za-z0-9_-]+/g, "[REDACTED]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .slice(0, 500);
}
