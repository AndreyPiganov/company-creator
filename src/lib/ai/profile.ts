import type { CompanyGenerationInput, CompanyProfile } from "@/lib/domain/company";
import { assertValidCompany } from "@/lib/domain/validate";
import type { GeneratedCompanyContent } from "./content-schema";
import type { ProviderId } from "./types";

const disclaimer = {
  ru: "Это вымышленная компания и демонстрационные проектные данные. Сведения не подтверждают существование или регистрацию юридического лица.",
  de: "Dies ist ein fiktives Unternehmen mit Demonstrationsdaten. Die Angaben bestätigen weder die Existenz noch die Registrierung einer juristischen Person.",
};

function stableAsset(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 2 === 0 ? "/assets/team/team-warm.png" : "/assets/team/team-cool.png";
}

export function createProfileFromContent(
  content: GeneratedCompanyContent,
  input: CompanyGenerationInput,
  provider: ProviderId,
  model: string,
): CompanyProfile {
  const seed = input.seed || crypto.randomUUID();
  const asset = stableAsset(seed);
  return assertValidCompany({
    schemaVersion: 1,
    id: crypto.randomUUID(),
    status: "draft",
    revision: 1,
    ...content,
    businessDirection: "b2b-ai-investment-research",
    faq: content.faq.map((item) => ({ ...item, id: crypto.randomUUID() })),
    team: content.team.map((member, position) => ({
      ...member,
      id: crypto.randomUUID(),
      photo: {
        asset,
        position,
        alt: {
          ru: `Портрет ${member.name}`,
          de: `Porträt von ${member.name}`,
        },
      },
    })),
    disclaimer,
    generation: {
      mode: provider,
      provider,
      model,
      seed,
      generatedAt: new Date().toISOString(),
    },
  });
}
