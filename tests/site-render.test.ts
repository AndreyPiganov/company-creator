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
    expect(files["styles.css"]).toContain('url("assets/team.png")');
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
});
