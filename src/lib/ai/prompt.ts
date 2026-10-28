import type { CompanyGenerationInput } from "@/lib/domain/company";

export function buildCompanyPrompt(input: CompanyGenerationInput): string {
  const brandInstruction = input.brandName
    ? `Use the exact brand name "${input.brandName}" and derive a plausible fictional German legal name from it.`
    : "Create an original, pronounceable brand name that is not a known company.";
  const sizeInstruction = input.size === "random" ? "Choose small or medium." : `The company size must be ${input.size}.`;
  const serviceInstruction =
    input.serviceType === "random" ? "Choose one of the allowed service types." : `The service type must be ${input.serviceType}.`;

  return `Create a fully fictional German B2B company profile for an AI-assisted investment research and data analysis service.

${brandInstruction}
${sizeInstruction}
${serviceInstruction}

Return every descriptive field in both Russian (ru) and German (de), preserving the same facts and meaning. The company must have exactly five distinct team members with realistic but fictional names, roles and professional backgrounds, plus exactly five useful product FAQ items. Make the history, specialisation, product workflow and team experience specific and internally consistent rather than generic.

Use only these cities and exact telephone prefixes: Berlin +49 30, München +49 89, Frankfurt am Main +49 69, Hamburg +49 40, Köln +49 221. Use a syntactically valid but clearly demonstrational phone number with zero blocks. Use a reserved .example email domain based on the brand. The street address must be plausible but explicitly demonstrational (for example Musterweg or Beispielallee).

Do not invent registrations, licences, customers, testimonials, performance statistics, legal verification, file upload, accounts, or automated investment decisions. State concrete product limitations: it does not replace legal, tax, financial or human investment review. Do not include markdown, placeholders or commentary outside the structured result.`;
}
