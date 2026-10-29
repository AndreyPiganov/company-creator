import { UnprocessableEntityException } from "@nestjs/common";
import { z, type ZodType } from "zod";

export function parseBody<T>(schema: ZodType<T>, input: unknown, message: string): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throw new UnprocessableEntityException({
      error: message,
      details: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
  }
  return parsed.data;
}

export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}
