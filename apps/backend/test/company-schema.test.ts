import { describe, expect, it } from "vitest";
import { sampleCompanies } from "@/lib/generation/samples";
import { generateOfflineCompany } from "@/lib/generation/offline";
import { validateCompanyConsistency } from "@/lib/domain/validate";
import { CITY_PHONE_PREFIX } from "@/lib/domain/catalogues";

describe("company profile schema", () => {
  it("accepts both bundled examples", () => {
    for (const company of sampleCompanies) {
      const result = validateCompanyConsistency(company);
      expect(result.issues).toEqual([]);
      expect(result.profile?.team).toHaveLength(5);
      expect(result.profile?.faq).toHaveLength(5);
    }
  });

  it("rejects a telephone prefix that does not match the city", () => {
    const company = structuredClone(sampleCompanies[0]);
    company.contact.phone = "+49 89 0000 1234";
    const result = validateCompanyConsistency(company);
    expect(result.issues).toContainEqual(expect.objectContaining({ path: "contact.phone" }));
  });

  it("rejects placeholders in bilingual fields", () => {
    const company = structuredClone(sampleCompanies[0]);
    company.product.summary.ru = "TODO заполнить описание";
    const result = validateCompanyConsistency(company);
    expect(result.issues).toContainEqual(expect.objectContaining({ path: "product.summary.ru" }));
  });

  it("accepts manually added employees and rejects a team below the required minimum", () => {
    const expanded = structuredClone(sampleCompanies[0]);
    expanded.team.push({ ...structuredClone(expanded.team[0]), id: crypto.randomUUID(), name: "Manual Employee" });
    expect(validateCompanyConsistency(expanded).profile?.team).toHaveLength(6);
    expanded.team = expanded.team.slice(0, 4);
    expect(validateCompanyConsistency(expanded).issues).toContainEqual(expect.objectContaining({ path: "team" }));
  });
});

describe("offline generator", () => {
  const baseInput = {
    brandName: "",
    country: "DE" as const,
    businessDirection: "b2b-ai-investment-research" as const,
    serviceType: "market-intelligence" as const,
    size: "small" as const,
    provider: "offline" as const,
  };

  it("creates a complete RU/DE profile without a provider", () => {
    const company = generateOfflineCompany({ ...baseInput, seed: "schema-test-a" });
    expect(validateCompanyConsistency(company).issues).toEqual([]);
    expect(company.generation).toMatchObject({ mode: "offline", provider: null, model: null });
    expect(company.status).toBe("draft");
    expect(company.team).toHaveLength(5);
    expect(company.faq).toHaveLength(5);
    expect(company.contact.phone.startsWith(CITY_PHONE_PREFIX[company.contact.city])).toBe(true);
    expect(company.history.ru.length).toBeGreaterThan(80);
    expect(company.history.de.length).toBeGreaterThan(80);
  });

  it("varies history, specialisation, people and brand for equal inputs", () => {
    const first = generateOfflineCompany({ ...baseInput, seed: "variation-one" });
    const second = generateOfflineCompany({ ...baseInput, seed: "variation-two" });
    expect(first.brandName).not.toBe(second.brandName);
    expect(first.history).not.toEqual(second.history);
    expect(first.specialisation).not.toEqual(second.specialisation);
    expect(first.team.map((member) => member.name)).not.toEqual(second.team.map((member) => member.name));
  });
});
