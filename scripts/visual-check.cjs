/* Run against the local Docker stack with Playwright installed separately. */
const assert = require("node:assert/strict");
const { mkdir, writeFile } = require("node:fs/promises");
const { createHash } = require("node:crypto");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const base = process.env.QA_BASE_URL || "http://localhost:3000";
const output = process.env.QA_OUTPUT_DIR || ".qa";
const examples = [
  { companyId: "71fd54b4-5cc4-4b9c-8e9a-3eab62dce101", language: "ru", theme: "forest" },
  { companyId: "82ae65c5-6dd5-4cad-9fab-4fbc73edf202", language: "de", theme: "midnight" },
];
const digest = (body) => createHash("sha256").update(body).digest("hex");
async function json(path, options) {
  const response = await fetch(base + path, options);
  assert(response.ok, `${path}: ${response.status}`);
  return response.json();
}
async function waitJob(id) {
  for (let i = 0; i < 60; i++) {
    const { job } = await json(`/api/jobs/${id}`);
    if (job.state === "complete") return job.resultId;
    assert.notEqual(job.state, "failed", job.error);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Site generation timed out");
}

async function run() {
  await mkdir(output, { recursive: true });
  const catalogue = await json("/api/providers");
  const openAiModels = catalogue.providers.find((provider) => provider.id === "openai").models;
  const report = { examples: [], pages: [], button: null };
  for (const example of examples) {
    const { sites } = await json(`/api/companies/${example.companyId}/sites`);
    const oldId = sites.at(-1).id;
    const oldUrl = `/sites/${oldId}/preview/index.html`;
    const before = digest(await (await fetch(base + oldUrl)).text());
    let newId = sites[0].id;
    if (process.env.QA_CREATE_VERSIONS === "1") {
      const { job } = await json(`/api/companies/${example.companyId}/sites`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: example.language, theme: example.theme }),
      });
      newId = await waitJob(job.id);
    }
    const after = digest(await (await fetch(base + oldUrl)).text());
    assert.equal(after, before, "Old site version changed");
    const zip = await fetch(`${base}/api/sites/${newId}/download`);
    assert(zip.ok && zip.headers.get("content-type").includes("zip"));
    const zipBytes = Buffer.from(await zip.arrayBuffer());
    assert.equal(zipBytes.subarray(0, 2).toString(), "PK");
    await writeFile(`${output}/example-${example.language}.zip`, zipBytes);
    report.examples.push({ ...example, siteId: newId, oldId, oldChecksum: before });
  }

  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 950 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const routes = [
        ["home", "/"], ["library", "/companies"], ["generate", "/companies/new"],
        ["themes", `/companies/${examples[0].companyId}/sites/new`],
        ...report.examples.flatMap((example) => ["index", "product", "company"].map((file) => [`${example.language}-${file}`, `/sites/${example.siteId}/preview/${file}.html`])),
      ];
      for (const [name, path] of routes) {
        const response = await page.goto(base + path, { waitUntil: "networkidle" });
        assert(response.ok(), `${path}: ${response.status()}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflow, false, `${name} overflows at ${width}px`);
        if (name === "home") {
          const button = page.getByRole("link", { name: "Создать компанию" }).first();
          const style = await button.evaluate((element) => ({ color: getComputedStyle(element).color, background: getComputedStyle(element).backgroundImage }));
          assert.equal(style.color, "rgb(255, 255, 255)");
          assert(style.background.includes("linear-gradient"));
          report.button = style;
        }
        if (name === "generate") {
          const provider = page.locator('select[name="provider"]');
          if (await provider.locator('option[value="openai"]').isEnabled()) {
            await provider.selectOption("openai");
            await page.waitForFunction((count) => document.querySelectorAll('select[name="model"] option').length === count, openAiModels.length + 1);
            await page.waitForFunction((expected) => document.querySelector('option[value="gpt-6-astra"]')?.disabled === expected, openAiModels.find((model) => model.id === "gpt-6-astra").exceedsBudget);
            await page.getByRole("searchbox").fill("4.1");
            if (!openAiModels.find((model) => model.id === "gpt-4.1-mini").exceedsBudget) {
              await page.locator('select[name="model"]').selectOption("gpt-4.1-mini");
              assert(await page.getByText("За 1 млн токенов:").isVisible());
            }
          }
        }
        if (name === "themes") {
          await page.locator('label.theme-option').filter({ hasText: "Ягодный" }).click();
          assert(await page.locator('input[value="berry"]').isChecked());
        }
        await page.screenshot({ path: `${output}/${name}-${width}.png`, fullPage: true });
        report.pages.push({ name, width, status: response.status() });
      }
      assert.deepEqual(errors, [], "Browser JavaScript errors");
      await context.close();
    }
  } finally { await browser.close(); }
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
