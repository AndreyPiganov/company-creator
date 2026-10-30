import { describe, expect, it } from "vitest";
import { sampleCompanies } from "@/lib/generation/samples";
import { renderSiteFiles } from "@/lib/site/render";

describe("static site renderer", () => {
  it("renders three autonomous pages and local assets", () => {
    const company = sampleCompanies[0];
    const files = renderSiteFiles(company, "ru", "forest");
    expect(Object.keys(files).sort()).toEqual(["company.html", "favicon.svg", "index.html", "product.html", "styles.css"]);
    expect(files["index.html"]).toContain(company.brandName);
    expect(files["index.html"]).toContain(company.product.summary.ru);
    expect(files["product.html"]).toContain(company.product.limitations.ru);
    expect(files["company.html"]).toContain(company.contact.phone);
    expect(files["company.html"]?.match(/class="portrait p/g)).toHaveLength(5);
    expect(files["company.html"]).toContain("assets/person-0.png");
  });

  it("keeps canonical facts and contains no unresolved placeholders or remote assets", () => {
    const company = sampleCompanies[1];
    const files = renderSiteFiles(company, "de", "midnight");
    const html = [files["index.html"], files["product.html"], files["company.html"]].join("\n");
    for (const member of company.team) expect(html).toContain(member.name);
    for (const faq of company.faq) expect(html).toContain(faq.question.de);
    expect(html).not.toMatch(/\{\{|TODO|LOREM IPSUM/i);
    expect(`${html}\n${files["styles.css"]}`).not.toMatch(/https?:\/\//i);
  });

  it("escapes metadata once and preserves facts across every theme and language", () => {
    const profile = structuredClone(sampleCompanies[0]);
    profile.product.name = { ru: "Обзор & анализ", de: "Research & Analyse" };
    profile.product.summary = { ru: 'Материалы & "источники"', de: 'Daten & "Quellen"' };
    for (const language of ["ru", "de"] as const) {
      for (const theme of ["forest", "midnight", "sand", "berry"] as const) {
        const files = renderSiteFiles(profile, language, theme);
        expect(files["product.html"]).toContain(language === "ru" ? "Обзор &amp; анализ" : "Research &amp; Analyse");
        expect(files["product.html"]).not.toContain("&amp;amp;");
        expect(files["index.html"]).toContain('class="research-board"');
        expect(files["index.html"]).toContain(profile.product.inputs[language]);
        expect(files["company.html"]).toContain(profile.legalName);
        expect(files["company.html"]?.match(/class="portrait p/g)).toHaveLength(profile.team.length);
        expect(files["styles.css"]).toContain("prefers-reduced-motion");
        expect(files["styles.css"]).toContain("@media(max-width:680px)");
      }
    }
  });

  it("renders every manually added employee", () => {
    const profile = structuredClone(sampleCompanies[0]);
    profile.team.push({ ...structuredClone(profile.team[0]), id: crypto.randomUUID(), name: "Manual Employee", photo: { ...profile.team[0].photo, position: 1 } });
    const files = renderSiteFiles(profile, "ru", "forest");
    expect(files["company.html"]).toContain("Manual Employee");
    expect(files["company.html"]?.match(/class="portrait p/g)).toHaveLength(6);
    expect(files["company.html"]).toContain("assets/person-5.png");
  });
});
