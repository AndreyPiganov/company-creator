import { z } from "zod";
import { companySizeSchema, localisedTextSchema } from "@/lib/domain/company";

export const generatedCompanyContentSchema = z.object({
  brandName: z.string().trim().min(2).max(80),
  legalName: z.string().trim().min(3).max(120),
  contact: z.object({
    country: z.literal("DE"),
    city: z.enum(["Berlin", "München", "Frankfurt am Main", "Hamburg", "Köln"]),
    address: z.string().trim().min(8).max(160),
    phone: z.string().trim().regex(/^\+49 [0-9 ]{7,18}$/),
    email: z.string().trim().email().max(160),
  }),
  serviceType: z.enum([
    "investment-due-diligence",
    "market-intelligence",
    "portfolio-monitoring",
    "document-data-analysis",
  ]),
  size: companySizeSchema,
  history: localisedTextSchema,
  specialisation: localisedTextSchema,
  audience: localisedTextSchema,
  customerProblem: localisedTextSchema,
  product: z.object({
    name: localisedTextSchema,
    summary: localisedTextSchema,
    inputs: localisedTextSchema,
    process: localisedTextSchema,
    output: localisedTextSchema,
    limitations: localisedTextSchema,
  }),
  faq: z.array(z.object({ question: localisedTextSchema, answer: localisedTextSchema })).length(5),
  team: z
    .array(
      z.object({
        name: z.string().trim().min(3).max(100),
        role: localisedTextSchema,
        bio: localisedTextSchema,
      }),
    )
    .length(5),
});

export type GeneratedCompanyContent = z.infer<typeof generatedCompanyContentSchema>;
