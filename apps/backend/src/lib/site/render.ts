import type { CompanyProfile, SiteLanguage, SiteTheme } from "../domain/company";
import { SERVICE_LABELS } from "../domain/catalogues";
import { THEMES } from "./themes";

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
  const titles = { home: profile.brandName, product: l(profile.product.name, language), company: labels.company };
  const descriptions = {
    home: l(profile.product.summary, language),
    product: l(profile.product.output, language),
    company: l(profile.history, language),
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
  <header class="site-header">
    <a class="brand" href="index.html" aria-label="${escapeHtml(profile.brandName)}">${escapeHtml(profile.brandName)}<small>${escapeHtml(SERVICE_LABELS[profile.serviceType][language])}</small></a>
    <nav aria-label="${de ? "Hauptnavigation" : "Основная навигация"}">
      ${(["home", "product", "company"] as const).map((item) => `<a href="${href(item)}"${item === page ? ' aria-current="page"' : ""}>${labels[item]}</a>`).join("")}
    </nav>
  </header>
  <main>${body}</main>
  <footer class="footer"><div><strong>${escapeHtml(profile.brandName)}</strong><p>${l(profile.disclaimer, language)}</p></div><span>${labels.project}</span></footer>
</body>
</html>`;
}

function home(profile: CompanyProfile, language: SiteLanguage, theme: SiteTheme) {
  const de = language === "de";
  const body = `
  <section class="hero wrap">
    <div class="eyebrow">${escapeHtml(SERVICE_LABELS[profile.serviceType][language])} · ${escapeHtml(profile.contact.city)}</div>
    <h1>${l(profile.product.name, language)}</h1>
    <p class="lead">${l(profile.product.summary, language)}</p>
    <div class="actions"><a class="button" href="product.html">${de ? "Produkt ansehen" : "Посмотреть продукт"}</a><a class="text-link" href="company.html">${de ? "Team kennenlernen" : "Познакомиться с командой"} →</a></div>
  </section>
  <section class="statement"><div class="wrap split"><p class="kicker">${de ? "Für wen" : "Для кого"}</p><div><h2>${l(profile.audience, language)}</h2><p>${l(profile.customerProblem, language)}</p></div></div></section>
  <section class="wrap section"><div class="section-head"><p class="kicker">${de ? "Arbeitsweise" : "Как устроена работа"}</p><h2>${de ? "Vom Material zur prüfbaren Übersicht" : "От материалов к проверяемому обзору"}</h2></div><div class="steps">
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

function company(profile: CompanyProfile, language: SiteLanguage, theme: SiteTheme) {
  const de = language === "de";
  const body = `
  <section class="page-hero wrap"><p class="eyebrow">${de ? "Unternehmen" : "Компания"}</p><h1>${de ? "Research mit nachvollziehbarem Ursprung" : "Исследование с понятным происхождением"}</h1><p class="lead">${l(profile.history, language)}</p></section>
  <section class="statement"><div class="wrap split"><p class="kicker">${de ? "Fokus" : "Фокус"}</p><h2>${l(profile.specialisation, language)}</h2></div></section>
  <section class="wrap section"><div class="section-head"><p class="kicker">${de ? "Team" : "Команда"}</p><h2>${de ? "Fünf Perspektiven, ein Prüfprozess" : "Пять перспектив, один процесс проверки"}</h2></div><div class="team">${profile.team.map((member) => `<article><div class="portrait p${member.photo.position}" role="img" aria-label="${l(member.photo.alt, language)}"></div><h3>${escapeHtml(member.name)}</h3><p class="role">${l(member.role, language)}</p><p>${l(member.bio, language)}</p></article>`).join("")}</div></section>
  <section class="contact"><div class="wrap contact-grid"><div><p class="kicker">${de ? "Kontakt" : "Контакты"}</p><h2>${escapeHtml(profile.legalName)}</h2><p>${escapeHtml(profile.contact.address)}</p></div><div><a href="mailto:${escapeHtml(profile.contact.email)}">${escapeHtml(profile.contact.email)}</a><a href="tel:${escapeHtml(profile.contact.phone.replace(/\s/g, ""))}">${escapeHtml(profile.contact.phone)}</a></div></div></section>`;
  return shell(profile, language, theme, "company", body);
}

export function renderSiteFiles(profile: CompanyProfile, language: SiteLanguage, theme: SiteTheme): Record<string, string> {
  const colors = THEMES[theme].colors;
  const css = `:root{--ink:${colors.ink};--muted:${colors.muted};--paper:${colors.paper};--surface:${colors.surface};--accent:${colors.accent};--soft:${colors.soft};--line:${colors.line}}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65}a{color:inherit;text-decoration:none}.wrap{width:min(1120px,calc(100% - 40px));margin:auto}.site-header{width:min(1240px,calc(100% - 32px));margin:16px auto 0;display:flex;align-items:center;justify-content:space-between;gap:28px;border:1px solid var(--line);border-radius:18px;background:color-mix(in srgb,var(--surface) 92%,transparent);padding:14px 18px;position:relative;z-index:2}.brand{font-weight:750;letter-spacing:-.03em}.brand small{display:block;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}nav{display:flex;gap:5px;flex-wrap:wrap}nav a{padding:8px 11px;border-radius:9px;font-size:14px}nav a[aria-current=page]{background:var(--soft);color:var(--accent);font-weight:700}.hero{padding:110px 0 125px}.page-hero{padding:90px 0 80px}.eyebrow,.kicker{text-transform:uppercase;letter-spacing:.15em;font-size:12px;font-weight:800;color:var(--accent)}h1,h2,h3,p{margin-top:0}h1{max-width:900px;margin:18px 0 26px;font-size:clamp(54px,9vw,112px);line-height:.92;letter-spacing:-.065em}.page-hero h1{font-size:clamp(48px,7vw,86px)}.lead{max-width:760px;font-size:clamp(20px,2.5vw,28px);line-height:1.45;color:var(--muted)}.actions{margin-top:36px;display:flex;align-items:center;gap:24px;flex-wrap:wrap}.button{display:inline-flex;background:var(--accent);color:white;border-radius:12px;padding:13px 19px;font-weight:750}.text-link{font-weight:750;color:var(--accent)}.statement{background:var(--ink);color:var(--surface);padding:70px 0}.statement .kicker{color:var(--soft)}.split{display:grid;grid-template-columns:180px 1fr;gap:40px}.split h2{max-width:850px;font-size:clamp(28px,4vw,48px);line-height:1.18;letter-spacing:-.04em}.split p:last-child{max-width:740px;color:color-mix(in srgb,var(--surface) 70%,transparent)}.section{padding:95px 0}.section-head{display:grid;grid-template-columns:180px 1fr;gap:40px;margin-bottom:42px}.section-head h2{max-width:780px;font-size:clamp(32px,4vw,52px);line-height:1.1;letter-spacing:-.045em}.steps{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line)}.steps article{padding:28px 28px 0 0;border-right:1px solid var(--line)}.steps article+article{padding-left:28px}.steps article:last-child{border:0}.steps span{font-size:12px;font-weight:800;color:var(--accent)}.steps h3{margin:25px 0 10px;font-size:24px}.steps p,.product-grid p,.team article>p:last-child{color:var(--muted)}.callout{margin-bottom:95px;border:1px solid var(--line);border-radius:28px;background:var(--surface);padding:52px}.callout h2{max-width:880px;font-size:clamp(28px,3.5vw,46px);line-height:1.2;letter-spacing:-.035em}.product-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line);padding:1px}.product-grid article{background:var(--surface);padding:40px}.product-grid .limit{background:var(--ink);color:var(--surface)}.product-grid .limit p:last-child{color:color-mix(in srgb,var(--surface) 70%,transparent)}.faq{background:var(--surface)}.faq-list details{border-top:1px solid var(--line);padding:22px 0}.faq-list details:last-child{border-bottom:1px solid var(--line)}summary{cursor:pointer;font-size:20px;font-weight:750;letter-spacing:-.02em}.faq-list details p{max-width:800px;margin:15px 0 0;color:var(--muted)}.team{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}.team article{min-width:0}.portrait{aspect-ratio:3/4;border-radius:16px;background-image:url("assets/team.png");background-size:500% auto;background-position-y:center;background-repeat:no-repeat}.p0{background-position-x:0}.p1{background-position-x:25%}.p2{background-position-x:50%}.p3{background-position-x:75%}.p4{background-position-x:100%}.team h3{margin:18px 0 2px;font-size:19px;letter-spacing:-.025em}.team .role{color:var(--accent);font-size:13px;font-weight:750}.team article>p:last-child{font-size:14px;line-height:1.55}.contact{padding:70px 0;background:var(--soft)}.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:50px;align-items:end}.contact h2{font-size:clamp(32px,4vw,48px);letter-spacing:-.04em}.contact-grid>div:last-child{display:grid;gap:10px;font-size:20px;font-weight:750}.footer{width:min(1120px,calc(100% - 40px));margin:auto;display:flex;justify-content:space-between;gap:30px;padding:45px 0;color:var(--muted);font-size:12px}.footer p{max-width:720px;margin-top:5px}.footer span{text-transform:uppercase;letter-spacing:.1em;white-space:nowrap}@media(max-width:900px){.team{grid-template-columns:repeat(2,1fr)}.steps{grid-template-columns:1fr}.steps article,.steps article+article{border-right:0;border-bottom:1px solid var(--line);padding:26px 0}.split,.section-head{grid-template-columns:1fr;gap:12px}.product-grid{grid-template-columns:1fr}}@media(max-width:680px){.site-header{align-items:flex-start;flex-direction:column}.site-header nav{width:100%}.site-header nav a{padding:7px}.hero{padding:70px 0 85px}h1{font-size:48px}.callout{padding:30px}.team{grid-template-columns:1fr}.portrait{aspect-ratio:4/3;background-size:500% auto}.contact-grid{grid-template-columns:1fr}.footer{flex-direction:column}.footer span{white-space:normal}}`;
  return {
    "index.html": home(profile, language, theme),
    "product.html": product(profile, language, theme),
    "company.html": company(profile, language, theme),
    "styles.css": css,
    "favicon.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${colors.ink}"/><path d="M18 43V21h17c7 0 11 4 11 10s-4 10-11 10h-8v2H18Zm9-10h8c2 0 3-1 3-2s-1-2-3-2h-8v4Z" fill="${colors.soft}"/></svg>`,
  };
}
