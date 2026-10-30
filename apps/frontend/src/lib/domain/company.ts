import { z } from "zod";

export const localisedTextSchema = z.object({
  ru: z.string().trim().min(2).max(4000),
  de: z.string().trim().min(2).max(4000),
});

export const companySizeSchema = z.enum(["small", "medium"]);
export const companyStatusSchema = z.enum(["draft", "approved"]);
export const generationModeSchema = z.enum(["sample", "offline", "openai", "openrouter"]);
export const MAX_TEAM_SIZE = 20;

const photoSchema = z.object({
  asset: z.union([z.enum(["/assets/team/team-warm.png", "/assets/team/team-cool.png"]), z.string().regex(/^\/api\/photos\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.jpg$/)]),
  position: z.number().int().min(0).max(4),
  alt: localisedTextSchema,
});

export const teamMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(3).max(100),
  role: localisedTextSchema,
  bio: localisedTextSchema,
  photo: photoSchema,
});

export const faqItemSchema = z.object({
  id: z.string().uuid(),
  question: localisedTextSchema,
  answer: localisedTextSchema,
});

export const companyProfileSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().uuid(),
  status: companyStatusSchema,
  revision: z.number().int().positive(),
  brandName: z.string().trim().min(2).max(80),
  legalName: z.string().trim().min(3).max(120),
  contact: z.object({
    country: z.literal("DE"),
    city: z.enum(["Berlin", "München", "Frankfurt am Main", "Hamburg", "Köln"]),
    address: z.string().trim().min(8).max(160),
    phone: z.string().trim().regex(/^\+49 [0-9 ]{7,18}$/),
    email: z.string().trim().email().max(160),
  }),
  businessDirection: z.literal("b2b-ai-investment-research"),
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
  faq: z.array(faqItemSchema).length(5),
  team: z.array(teamMemberSchema).min(5).max(MAX_TEAM_SIZE),
  disclaimer: localisedTextSchema,
  generation: z.object({
    mode: generationModeSchema,
    provider: z.enum(["openai", "openrouter"]).nullable(),
    model: z.string().trim().min(1).max(160).nullable(),
    seed: z.string().trim().min(1).max(120),
    generatedAt: z.string().datetime(),
  }),
});

export const companyGenerationInputSchema = z.object({
  brandName: z.string().trim().max(80).optional().default(""),
  country: z.literal("DE").default("DE"),
  businessDirection: z.literal("b2b-ai-investment-research").default("b2b-ai-investment-research"),
  serviceType: z
    .enum([
      "random",
      "investment-due-diligence",
      "market-intelligence",
      "portfolio-monitoring",
      "document-data-analysis",
    ])
    .default("random"),
  size: z.enum(["random", "small", "medium"]).default("random"),
  provider: z.enum(["offline", "openai", "openrouter"]).default("offline"),
  model: z.string().trim().max(160).optional(),
  seed: z.string().trim().max(120).optional(),
});

export const siteLanguageSchema = z.enum(["ru", "de"]);
export const siteThemeSchema = z.enum(["forest", "midnight", "sand", "berry"]);

export const siteGenerationInputSchema = z.object({
  language: siteLanguageSchema,
  theme: siteThemeSchema,
});

export type LocalisedText = z.infer<typeof localisedTextSchema>;
export type CompanyProfile = z.infer<typeof companyProfileSchema>;
export type CompanyGenerationInput = z.infer<typeof companyGenerationInputSchema>;
export type SiteLanguage = z.infer<typeof siteLanguageSchema>;
export type SiteTheme = z.infer<typeof siteThemeSchema>;

export type CompanySummary = Pick<
  CompanyProfile,
  "id" | "brandName" | "legalName" | "status" | "revision" | "size" | "serviceType"
> & {
  city: CompanyProfile["contact"]["city"];
  updatedAt: string;
  siteCount: number;
};
