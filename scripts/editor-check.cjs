/* Browser checks for settings, bilingual editing and immutable portrait exports. */
const assert = require("node:assert/strict");
const { mkdir, writeFile } = require("node:fs/promises");
const { createHash } = require("node:crypto");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.QA_BASE_URL || "http://localhost:3000";
const output = process.env.QA_OUTPUT_DIR || ".qa";
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function json(path, method = "GET", body) {
  const response = await fetch(base + path, { method, headers: { "content-type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  assert(response.ok, `${method} ${path}: ${response.status}`);
  return response.json();
}
async function waitJob(id) {
  for (let i = 0; i < 80; i++) {
    const { job } = await json(`/api/jobs/${id}`);
    assert.notEqual(job.state, "failed", job.error);
    if (job.state === "complete") return job.resultId;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error("Job timed out");
}

async function run() {
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch();
  const report = { pages: [], settingsUiMocked: true, companyId: null, siteIds: [] };
  try {
    // Exercise the UI without replacing the user's real provider credentials.
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 950 } });
      let statuses = ["openai", "openrouter"].map((id) => ({ id, configured: false, source: "none", environmentConfigured: false }));
      await page.route("**/api/settings/providers", async (route) => {
        if (route.request().method() === "PATCH") {
          const body = route.request().postDataJSON();
          statuses = statuses.map((status) => status.id === body.provider ? { ...status, configured: body.action === "save", source: body.action === "save" ? "panel" : "none" } : status);
        }
        await route.fulfill({ json: { providers: statuses } });
      });
      await page.goto(base + "/settings", { waitUntil: "networkidle" });
      const input = page.locator('input[name="openai-key"]');
      assert.equal(await input.getAttribute("type"), "password");
      await input.fill("ui-test-not-a-real-key");
      await page.getByRole("button", { name: "Сохранить ключ" }).first().click();
      await page.getByText("Ключ сохранён. Его можно использовать при создании компании.").waitFor();
      assert.equal(await input.inputValue(), "");
      assert.equal(await page.evaluate(() => localStorage.length), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      await page.screenshot({ path: `${output}/settings-${width}.png`, fullPage: true });
      await page.getByRole("button", { name: "Удалить ключ из панели" }).click();
      await page.getByText("Ключ из панели удалён.").waitFor();
      report.pages.push({ name: "settings", width });
      await page.close();
    }

    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + "/companies/new", { waitUntil: "networkidle" });
    await page.locator('input[name="brandName"]').fill("Portrait QA");
    await page.getByRole("button", { name: "Создать карточку" }).click();
    await page.waitForURL(/\/companies\/[a-f0-9-]{36}$/);
    const id = new URL(page.url()).pathname.split("/").at(-1);
    report.companyId = id;
    const original = (await json(`/api/companies/${id}`)).company;
    const ru = `${original.history.ru} Это проверка фотографии.`;
    const de = `${original.history.de} Dies ist eine Fotoprüfung.`;
    await page.locator('textarea[name="history.ru"]').fill(ru);
    await page.getByRole("button", { name: "Deutsch", exact: true }).click();
    await page.locator('textarea[name="history.de"]').fill(de);
    await page.getByRole("button", { name: "Русский", exact: true }).click();
    assert.equal(await page.locator('textarea[name="history.ru"]').inputValue(), ru);
    await page.waitForLoadState("networkidle");
    const portrait = await page.getByRole("img").first().screenshot();
    const uploaded = page.waitForResponse((response) => response.url().endsWith("/api/photos") && response.request().method() === "POST");
    await page.locator('input[type="file"]').first().setInputFiles({ name: "portrait.png", mimeType: "image/png", buffer: portrait });
    assert.equal((await uploaded).status(), 201);
    await page.getByRole("button", { name: "Сохранить", exact: true }).click();
    await page.getByText("Изменения сохранены. Карточка возвращена в черновик.").waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some((button) => button.textContent.trim() === "Утвердить" && !button.disabled));
    const saved = (await json(`/api/companies/${id}`)).company;
    assert.equal(saved.history.ru, ru);
    assert.equal(saved.history.de, de);
    assert(saved.team[0].photo.asset.startsWith("/api/photos/"));
    const originalBytes = Buffer.from(await (await fetch(base + saved.team[0].photo.asset)).arrayBuffer());
    const firstHash = digest(originalBytes);

    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const language of ["Русский", "Deutsch"]) {
        await page.getByRole("button", { name: language, exact: true }).click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        await page.screenshot({ path: `${output}/editor-${language === "Русский" ? "ru" : "de"}-${width}.png`, fullPage: true });
        report.pages.push({ name: `editor-${language}`, width });
      }
    }
    await page.getByRole("button", { name: "Утвердить", exact: true }).click();
    await page.getByText("Карточка утверждена и готова к созданию сайта.").waitFor();
    for (const language of ["ru", "de"]) {
      const { job } = await json(`/api/companies/${id}/sites`, "POST", { language, theme: language === "ru" ? "forest" : "berry" });
      const siteId = await waitJob(job.id);
      report.siteIds.push(siteId);
      await page.goto(`${base}/sites/${siteId}/preview/company.html`, { waitUntil: "networkidle" });
      assert.equal(await page.locator('img.portrait-upload').count(), 1);
      assert(await page.locator('img.portrait-upload').evaluate((img) => img.complete && img.naturalWidth === 960));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      await page.screenshot({ path: `${output}/uploaded-site-${language}-390.png`, fullPage: true });
      const zip = await fetch(`${base}/api/sites/${siteId}/download`);
      assert(zip.ok);
      await writeFile(`${output}/uploaded-site-${language}.zip`, Buffer.from(await zip.arrayBuffer()));
    }
    // Change the current company's photo; the existing artifact must keep its copy.
    const changed = structuredClone(saved);
    changed.team[0].photo = changed.team[1].photo;
    await json(`/api/companies/${id}`, "PATCH", changed);
    const oldPhoto = await fetch(`${base}/sites/${report.siteIds[0]}/preview/assets/person-0.jpg`);
    assert(oldPhoto.ok);
    assert.equal(digest(Buffer.from(await oldPhoto.arrayBuffer())), firstHash);
    assert.equal((await json(`/api/companies/${id}`)).company.status, "draft");
    // Leave the QA company with its uploaded portrait visible for review.
    await json(`/api/companies/${id}`, "PATCH", saved);
    await json(`/api/companies/${id}/approve`, "POST");
    assert.deepEqual(errors, []);
    await writeFile(`${output}/editor-report.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
