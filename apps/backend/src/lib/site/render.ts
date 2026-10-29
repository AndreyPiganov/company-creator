import type { CompanyProfile, SiteLanguage, SiteTheme } from "../domain/company";
import { SERVICE_LABELS } from "../domain/catalogues";
import { THEMES } from "./themes";
import { SITE_STYLES } from "./styles";
import { PHOTO_ASSET_PATTERN, sitePhotoFile } from "../media/photos";

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);
}

function l(value: { ru: string; de: string }, language: SiteLanguage): string {
  return escapeHtml(value[language]);
}

function shell(profile: CompanyProfile, language: SiteLanguage, theme: SiteTheme, page: "home" | "product" | "company", body: string) {
  const de = language === "de";
  const labels = de
    ? { home: "Start", product: "Produkt", company: "Unternehmen & Kontakt", project: "Fiktive Projektdaten" }
    : { home: "Главная", product: "Продукт", company: "Компания и контакты", project: "Вымышленные проектные данные" };
  const titles = { home: labels.home, product: profile.product.name[language], company: labels.company };
  const descriptions = {
    home: profile.product.summary[language],
    product: profile.product.output[language],
    company: profile.history[language],
  };
  const href = (target: typeof page) => (target === "home" ? "index.html" : `${target}.html`);
  return `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(titles[page])} · ${escapeHtml(profile.brandName)}</title>
  <meta name="description" content="${escapeHtml(descriptions[page])}">
  <meta name="robots" content="noindex,nofollow">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip-link" href="#main">${de ? "Zum Inhalt" : "К содержанию"}</a>
  <header class="site-header">
    <a class="brand" href="index.html" aria-label="${escapeHtml(profile.brandName)}">${escapeHtml(profile.brandName)}<small>${escapeHtml(SERVICE_LABELS[profile.serviceType][language])}</small></a>
    <nav aria-label="${de ? "Hauptnavigation" : "Основная навигация"}">
      ${(["home", "product", "company"] as const).map((item) => `<a href="${href(item)}"${item === page ? ' aria-current="page"' : ""}>${labels[item]}</a>`).join("")}
    </nav>
  </header>
  <main id="main">${body}</main>
  <footer class="footer"><div><strong>${escapeHtml(profile.brandName)}</strong><p>${l(profile.disclaimer, language)}</p></div><span>${labels.project}</span></footer>
</body>
</html>`;
}

function home(profile: CompanyProfile, language: SiteLanguage, theme: SiteTheme) {
  const de = language === "de";
  const body = `
  <section class="hero wrap">
    <div>
    <div class="eyebrow">${escapeHtml(SERVICE_LABELS[profile.serviceType][language])} · ${escapeHtml(profile.contact.city)}</div>
    <h1>${l(profile.product.name, language)}</h1>
    <p class="lead">${l(profile.product.summary, language)}</p>
    <div class="actions"><a class="button" href="product.html">${de ? "Produkt ansehen" : "Посмотреть продукт"}</a><a class="text-link" href="company.html">${de ? "Team kennenlernen" : "Познакомиться с командой"} →</a></div>
    </div>
    <aside class="research-board" aria-label="${de ? "Arbeitsablauf" : "Схема работы"}">
      <div class="board-heading"><span><i class="board-dot" aria-hidden="true"></i>${de ? "Arbeitsablauf" : "Схема работы"}</span><span>01 — 03</span></div>
      ${([
        [de ? "Eingaben" : "Исходные материалы", profile.product.inputs],
        [de ? "Verarbeitung" : "Обработка", profile.product.process],
        [de ? "Ergebnis" : "Результат", profile.product.output],
      ] as const).map(([title, content], index) => `<div class="board-step"><span>0${index + 1}</span><div><h3>${title}</h3><p>${l(content, language)}</p></div></div>`).join("")}
      <p class="board-note">${de ? "Fiktive Projektdaten · Darstellung des beschriebenen Services" : "Проектные данные · схема описанного сервиса"}</p>
    </aside>
  </section>
  <div class="wrap fact-strip"><div>${de ? "Standort" : "Город"}<strong>${escapeHtml(profile.contact.city)} · ${de ? "Deutschland" : "Германия"}</strong></div><div>${de ? "Fachgebiet" : "Направление"}<strong>${escapeHtml(SERVICE_LABELS[profile.serviceType][language])}</strong></div><div>${de ? "Team" : "Команда"}<strong>${profile.team.length} ${de ? "Personen im Profil" : "сотрудников в карточке"}</strong></div></div>
  <section class="statement"><div class="wrap split"><p class="kicker">${de ? "Für wen" : "Для кого"}</p><div><h2>${l(profile.audience, language)}</h2><p>${l(profile.customerProblem, language)}</p></div></div></section>
  <section class="wrap section"><div class="section-head"><p class="kicker">${de ? "Arbeitsweise" : "Как устроена работа"}</p><h2>${de ? "Materialien, Prozess und Ergebnis" : "Материалы, процесс и результат"}</h2></div><div class="steps">
    <article><span>01</span><h3>${de ? "Eingang" : "Вход"}</h3><p>${l(profile.product.inputs, language)}</p></article>
    <article><span>02</span><h3>${de ? "Analyse" : "Анализ"}</h3><p>${l(profile.product.process, language)}</p></article>
    <article><span>03</span><h3>${de ? "Ergebnis" : "Результат"}</h3><p>${l(profile.product.output, language)}</p></article>
  </div></section>
  <section class="wrap callout"><p class="kicker">${de ? "Klare Grenze" : "Чёткая граница"}</p><h2>${l(profile.product.limitations, language)}</h2><a class="text-link" href="product.html">${de ? "Details und FAQ" : "Подробности и FAQ"} →</a></section>`;
  return shell(profile, language, theme, "home", body);
}

function product(profile: CompanyProfile, language: SiteLanguage, theme: SiteTheme) {
  const de = language === "de";
  const body = `
  <section class="page-hero wrap"><p class="eyebrow">${de ? "Produkt" : "Продукт"}</p><h1>${l(profile.product.name, language)}</h1><p class="lead">${l(profile.product.summary, language)}</p></section>
  <section class="wrap section product-grid">
    <article><p class="kicker">01 · ${de ? "Eingaben" : "Входные данные"}</p><p>${l(profile.product.inputs, language)}</p></article>
    <article><p class="kicker">02 · ${de ? "Verarbeitung" : "Процесс"}</p><p>${l(profile.product.process, language)}</p></article>
    <article><p class="kicker">03 · ${de ? "Ausgabe" : "Результат"}</p><p>${l(profile.product.output, language)}</p></article>
    <article class="limit"><p class="kicker">04 · ${de ? "Grenzen" : "Ограничения"}</p><p>${l(profile.product.limitations, language)}</p></article>
  </section>
  <section class="faq section"><div class="wrap"><div class="section-head"><p class="kicker">FAQ</p><h2>${de ? "Häufige Fragen" : "Частые вопросы"}</h2></div><div class="faq-list">${profile.faq.map((item, index) => `<details${index === 0 ? " open" : ""}><summary>${l(item.question, language)}</summary><p>${l(item.answer, language)}</p></details>`).join("")}</div></div></section>`;
  return shell(profile, language, theme, "product", body);
}

function portrait(member: CompanyProfile["team"][number], index: number, language: SiteLanguage) {
  const file = sitePhotoFile(member.photo, index);
  const alt = l(member.photo.alt, language);
  return PHOTO_ASSET_PATTERN.test(member.photo.asset)
    ? `<img class="portrait portrait-upload" src="${file}" alt="${alt}" width="960" height="1280" loading="lazy">`
    : `<div class="portrait p${member.photo.position}" style="background-image:url('${file}')" role="img" aria-label="${alt}"></div>`;
}

function company(profile: CompanyProfile, language: SiteLanguage, theme: SiteTheme) {
  const de = language === "de";
  const body = `
  <section class="page-hero wrap"><p class="eyebrow">${de ? "Unternehmen" : "Компания"} · ${escapeHtml(profile.contact.city)}</p><h1>${escapeHtml(profile.brandName)}</h1><p class="lead">${l(profile.history, language)}</p></section>
  <section class="statement"><div class="wrap split"><p class="kicker">${de ? "Fokus" : "Фокус"}</p><h2>${l(profile.specialisation, language)}</h2></div></section>
  <section class="wrap section"><div class="section-head"><p class="kicker">${de ? "Team" : "Команда"}</p><h2>${de ? "Menschen hinter dem Unternehmen" : "Люди, которые стоят за компанией"}</h2></div><div class="team">${profile.team.map((member, index) => `<article>${portrait(member, index, language)}<h3>${escapeHtml(member.name)}</h3><p class="role">${l(member.role, language)}</p><p>${l(member.bio, language)}</p></article>`).join("")}</div></section>
  <section class="contact"><div class="wrap contact-grid"><div><p class="kicker">${de ? "Kontakt" : "Контакты"}</p><h2>${escapeHtml(profile.legalName)}</h2><p>${escapeHtml(profile.contact.address)}</p></div><div><a href="mailto:${escapeHtml(profile.contact.email)}">${escapeHtml(profile.contact.email)}</a><a href="tel:${escapeHtml(profile.contact.phone.replace(/\s/g, ""))}">${escapeHtml(profile.contact.phone)}</a></div></div></section>`;
  return shell(profile, language, theme, "company", body);
}

export function renderSiteFiles(profile: CompanyProfile, language: SiteLanguage, theme: SiteTheme): Record<string, string> {
  const colors = THEMES[theme].colors;
  const css = `:root{--ink:${colors.ink};--muted:${colors.muted};--paper:${colors.paper};--surface:${colors.surface};--accent:${colors.accent};--soft:${colors.soft};--line:${colors.line}}${SITE_STYLES}`;
  return {
    "index.html": home(profile, language, theme),
    "product.html": product(profile, language, theme),
    "company.html": company(profile, language, theme),
    "styles.css": css,
    "favicon.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${colors.ink}"/><path d="M18 43V21h17c7 0 11 4 11 10s-4 10-11 10h-8v2H18Zm9-10h8c2 0 3-1 3-2s-1-2-3-2h-8v4Z" fill="${colors.soft}"/></svg>`,
  };
}
