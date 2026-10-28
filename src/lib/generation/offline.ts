import type { CompanyGenerationInput, CompanyProfile, LocalisedText } from "@/lib/domain/company";
import { CITY_PHONE_PREFIX } from "@/lib/domain/catalogues";
import type { GeneratedCompanyContent } from "@/lib/ai/content-schema";
import { createProfileFromContent } from "@/lib/ai/profile";

type ServiceType = CompanyProfile["serviceType"];

function t(ru: string, de: string): LocalisedText {
  return { ru, de };
}

function seededRandom(seed: string) {
  let state = 2166136261;
  for (const char of seed) {
    state ^= char.charCodeAt(0);
    state = Math.imul(state, 16777619);
  }
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, values: readonly T[]): T {
  return values[Math.floor(random() * values.length)]!;
}

const cities = ["Berlin", "München", "Frankfurt am Main", "Hamburg", "Köln"] as const;
const serviceTypes: ServiceType[] = [
  "investment-due-diligence",
  "market-intelligence",
  "portfolio-monitoring",
  "document-data-analysis",
];

const sectors = [
  t("промышленных технологий и цепочек поставок", "Industrietechnologie und Lieferketten"),
  t("B2B-программного обеспечения и повторяющейся выручки", "B2B-Software und wiederkehrende Umsätze"),
  t("энергетической инфраструктуры и переходных активов", "Energieinfrastruktur und Transformationsanlagen"),
  t("медицинских технологий и регулируемых закупок", "Medizintechnik und regulierte Beschaffung"),
];

const originStories = [
  t(
    "Компания выросла из совместного проекта инвестиционного аналитика и инженера данных, которые в 2019 году стандартизировали проверку разрозненных материалов для нескольких отраслевых сделок.",
    "Das Unternehmen entstand aus einem gemeinsamen Projekt eines Investmentanalysten und eines Data Engineers, die 2019 die Prüfung verteilter Unterlagen für mehrere Branchentransaktionen standardisierten.",
  ),
  t(
    "Основатели познакомились в команде корпоративной стратегии и в 2022 году собрали отдельную практику для раннего выявления слабых сигналов в исследованиях и управленческой отчётности.",
    "Die Gründer lernten sich in einem Corporate-Strategy-Team kennen und bauten 2022 eine eigene Praxis zur Früherkennung schwacher Signale in Research und Managementberichten auf.",
  ),
  t(
    "В 2020 году группа специалистов по рискам начала создавать воспроизводимые карты источников для инвестиционных комитетов; повторяемая методика стала основой самостоятельного сервиса.",
    "2020 begann eine Gruppe von Risikospezialisten, nachvollziehbare Quellenkarten für Investmentkomitees zu erstellen. Die wiederholbare Methodik wurde zur Grundlage eines eigenständigen Services.",
  ),
  t(
    "Практика появилась в 2021 году после серии проектов, где экспертам приходилось вручную восстанавливать происхождение показателей из презентаций, таблиц и отраслевых публикаций.",
    "Die Praxis entstand 2021 nach einer Reihe von Projekten, bei denen Fachleute die Herkunft von Kennzahlen aus Präsentationen, Tabellen und Branchenpublikationen manuell rekonstruieren mussten.",
  ),
];

const brandFirst = ["Quellen", "Nordspur", "Signalhain", "Klarfeld", "Datenbrück", "Prüfwerk", "Sichtkern", "Faktorlicht"];
const brandSecond = ["Research", "Analytics", "Insight", "Signals", "Advisory"];
const streets = ["Musterweg", "Beispielallee", "Projektstraße", "Datenweg", "Analyseplatz"];
const productSuffix = ["Compass", "Atlas", "Lens", "Signalboard", "Workbench"];

const people = [
  "Anna Keller", "Lukas Brandt", "Miriam Vogt", "Felix Werner", "Johanna Berg", "Daniel Krüger", "Elena Roth", "Martin Seidel", "Laura König", "Simon Albrecht",
  "Theresa Fink", "Niklas Urban", "Carolin Sauer", "Matthias Frank", "Eva Lindner", "Robert Stein", "Sophie Jäger", "Julian Bach", "Katrin Busch", "Andreas Wolf",
];

const serviceCopy: Record<
  ServiceType,
  {
    specialisation: (sector: LocalisedText) => LocalisedText;
    audience: LocalisedText;
    problem: LocalisedText;
    summary: LocalisedText;
    inputs: LocalisedText;
    process: LocalisedText;
    output: LocalisedText;
  }
> = {
  "investment-due-diligence": {
    specialisation: (sector) => t(`Первичная проверка инвестиционных материалов в области ${sector.ru} с явной связью каждого вывода с источником.`, `Erstprüfung von Investmentunterlagen im Bereich ${sector.de} mit eindeutiger Verknüpfung jedes Ergebnisses zur Quelle.`),
    audience: t("Инвестиционные команды, которым нужен воспроизводимый первый обзор сделки до подключения полного состава внешних консультантов.", "Investmentteams, die vor Einbindung aller externen Berater eine nachvollziehbare Erstprüfung benötigen."),
    problem: t("Допущения и цифры распределены между презентациями, моделями и внешними источниками, поэтому пробелы замечают поздно.", "Annahmen und Zahlen sind über Präsentationen, Modelle und externe Quellen verteilt, sodass Lücken spät auffallen."),
    summary: t("Структурированная первичная проверка материалов сделки с картой доказательств и очередью вопросов для аналитика.", "Strukturierte Erstprüfung von Transaktionsunterlagen mit Evidenzkarte und Fragenliste für Analysten."),
    inputs: t("Инвестиционный меморандум, финансовая модель, KPI и согласованные отраслевые источники.", "Investment-Memorandum, Finanzmodell, KPIs und abgestimmte Branchenquellen."),
    process: t("Сервис выделяет утверждения, связывает показатели с исходными фрагментами, отмечает расхождения и передаёт находки человеку для проверки.", "Der Service extrahiert Aussagen, verknüpft Kennzahlen mit Originalstellen, markiert Abweichungen und übergibt die Ergebnisse zur menschlichen Prüfung."),
    output: t("Карта источников, перечень допущений, противоречий и приоритизированных вопросов для следующей стадии проверки.", "Quellenkarte, Liste von Annahmen und Widersprüchen sowie priorisierte Fragen für die nächste Prüfphase."),
  },
  "market-intelligence": {
    specialisation: (sector) => t(`Сопоставление рыночных сигналов и конкурентных изменений в сфере ${sector.ru} для проверки инвестиционных гипотез.`, `Abgleich von Marktsignalen und Wettbewerbsveränderungen im Bereich ${sector.de} zur Prüfung von Investmenthypothesen.`),
    audience: t("Корпоративные и фондовые исследовательские группы, которым нужен единый обзор рынка с проверяемыми источниками.", "Corporate- und Fonds-Research-Teams, die einen einheitlichen Marktüberblick mit prüfbaren Quellen benötigen."),
    problem: t("Отраслевые публикации используют разные определения и периоды, поэтому сигналы сложно сравнивать и связывать с гипотезой.", "Branchenpublikationen nutzen unterschiedliche Definitionen und Zeiträume, wodurch Signale schwer vergleichbar und Hypothesen schwer prüfbar sind."),
    summary: t("Рабочая среда для нормализации рыночных источников и отслеживания изменений относительно исследовательской гипотезы.", "Arbeitsumgebung zur Normalisierung von Marktquellen und zur Verfolgung von Veränderungen gegenüber einer Research-Hypothese."),
    inputs: t("Список компаний и тем, открытые отраслевые публикации, исследовательские заметки и утверждённые критерии наблюдения.", "Unternehmens- und Themenlisten, öffentliche Branchenpublikationen, Research-Notizen und abgestimmte Beobachtungskriterien."),
    process: t("Материалы классифицируются по единому словарю, сопоставляются по периодам и источникам, после чего изменения проходят аналитическую проверку.", "Materialien werden nach einem gemeinsamen Wörterbuch klassifiziert, nach Zeiträumen und Quellen abgeglichen und anschließend analytisch geprüft."),
    output: t("Лента подтверждённых изменений, карта конкурентов, спорные сигналы и вопросы для дальнейшего исследования.", "Feed bestätigter Veränderungen, Wettbewerberkarte, strittige Signale und Fragen für weitere Analysen."),
  },
  "portfolio-monitoring": {
    specialisation: (sector) => t(`Нормализация управленческой отчётности и раннее обнаружение изменений в портфелях ${sector.ru}.`, `Normalisierung von Managementberichten und Früherkennung von Veränderungen in Portfolios aus ${sector.de}.`),
    audience: t("Управляющие фондами с несколькими портфельными компаниями и неоднородными форматами регулярной отчётности.", "Fondsmanager mit mehreren Portfoliounternehmen und heterogenen Formaten der regelmäßigen Berichterstattung."),
    problem: t("Показатели приходят в разных таблицах и определениях, поэтому изменения трудно увидеть до квартального обзора.", "Kennzahlen treffen in unterschiedlichen Tabellen und Definitionen ein, sodass Veränderungen vor dem Quartalsreview schwer erkennbar sind."),
    summary: t("Единый аналитический слой для сопоставления отчётных периодов и подготовки объяснимых сигналов для управляющей команды.", "Einheitliche Analyseschicht zum Vergleich von Berichtszeiträumen und zur Aufbereitung erklärbarer Signale für das Managementteam."),
    inputs: t("Утверждённые управленческие отчёты, KPI-таблицы, комментарии руководства и правила конкретного портфеля.", "Freigegebene Managementberichte, KPI-Tabellen, Kommentare der Geschäftsleitung und portfoliospezifische Regeln."),
    process: t("Показатели приводятся к общему словарю, сравниваются с предыдущими периодами и помечаются для проверки при изменении определения или значения.", "Kennzahlen werden auf ein gemeinsames Wörterbuch abgebildet, mit Vorperioden verglichen und bei Definitions- oder Wertänderungen zur Prüfung markiert."),
    output: t("Карточки показателей, лента изменений, ссылки на исходные отчёты и вопросы к следующему разговору с менеджментом.", "Kennzahlenkarten, Änderungsfeed, Verweise auf Originalberichte und Fragen für das nächste Managementgespräch."),
  },
  "document-data-analysis": {
    specialisation: (sector) => t(`Извлечение и сверка показателей из неоднородных документов для исследований ${sector.ru}.`, `Extraktion und Abgleich von Kennzahlen aus heterogenen Dokumenten für Analysen im Bereich ${sector.de}.`),
    audience: t("Исследовательские команды, которые регулярно объединяют факты из PDF, таблиц и текстовых отчётов.", "Research-Teams, die regelmäßig Fakten aus PDFs, Tabellen und Textberichten zusammenführen."),
    problem: t("Ручной перенос данных скрывает происхождение цифр и создаёт ошибки версий в итоговых аналитических таблицах.", "Manuelle Datenübertragung verschleiert die Herkunft von Zahlen und erzeugt Versionsfehler in analytischen Ergebnistabellen."),
    summary: t("Конвейер контролируемого извлечения данных, который сохраняет ссылку на источник и отделяет факт от интерпретации.", "Kontrollierte Datenextraktions-Pipeline, die Quellenbezüge erhält und Fakten von Interpretationen trennt."),
    inputs: t("Согласованный набор PDF, текстовых документов и таблиц вместе со схемой обязательных полей.", "Abgestimmter Bestand aus PDFs, Textdokumenten und Tabellen zusammen mit einem Schema der Pflichtfelder."),
    process: t("Система извлекает кандидаты значений, проверяет формат и контекст, а сомнительные случаи направляет аналитику без автоматического исправления.", "Das System extrahiert Wertkandidaten, prüft Format und Kontext und leitet unklare Fälle ohne automatische Korrektur an Analysten weiter."),
    output: t("Структурированный набор данных, журнал происхождения, список расхождений и очередь ручной проверки.", "Strukturierter Datensatz, Herkunftsprotokoll, Abweichungsliste und Warteschlange für manuelle Prüfung."),
  },
};

function asciiSlug(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "fictional-company";
}

export function generateOfflineCompany(rawInput: CompanyGenerationInput): CompanyProfile {
  const seed = rawInput.seed || crypto.randomUUID();
  const random = seededRandom(seed);
  const serviceType = rawInput.serviceType === "random" ? pick(random, serviceTypes) : rawInput.serviceType;
  const size = rawInput.size === "random" ? pick(random, ["small", "medium"] as const) : rawInput.size;
  const city = pick(random, cities);
  const sector = pick(random, sectors);
  const copy = serviceCopy[serviceType];
  const brandName = rawInput.brandName || `${pick(random, brandFirst)} ${pick(random, brandSecond)}`;
  const productName = `${brandName} ${pick(random, productSuffix)}`;
  const addressNumber = 4 + Math.floor(random() * 70);
  const phoneTail = String(1000 + Math.floor(random() * 8999));
  const personStart = Math.floor(random() * (people.length - 5));
  const selectedPeople = people.slice(personStart, personStart + 5);
  const roles = [
    t("Управляющий директор", "Geschäftsführung"),
    t("Руководитель исследований", "Leitung Research"),
    t("Руководитель данных", "Leitung Daten"),
    t("Инженер продукта", "Product Engineer"),
    t("Старший аналитик", "Senior Analyst"),
  ];
  const bios = [
    t(`Ранее руководил программами инвестиционного анализа в области ${sector.ru} и отвечает за методику и границы сервиса.`, `Leitete zuvor Investmentanalysen im Bereich ${sector.de} und verantwortet Methodik sowie Leistungsgrenzen des Services.`),
    t(`Специализируется на проверке рыночных гипотез и построении воспроизводимых исследовательских процессов для ${sector.ru}.`, `Spezialisiert auf die Prüfung von Markthypothesen und nachvollziehbare Research-Prozesse für ${sector.de}.`),
    t("Проектирует модели данных, словари показателей и контроль происхождения каждого извлечённого факта.", "Entwickelt Datenmodelle, Kennzahlenwörterbücher und die Herkunftskontrolle jedes extrahierten Fakts."),
    t("Создаёт надёжные конвейеры обработки документов и интерфейсы, в которых автоматические выводы можно проверить вручную.", "Entwickelt robuste Dokumentenpipelines und Oberflächen, in denen automatisierte Ergebnisse manuell überprüfbar bleiben."),
    t(`Проводит ручную проверку сложных случаев и формулирует вопросы для инвестиционных команд в проектах ${sector.ru}.`, `Prüft komplexe Fälle manuell und formuliert Fragen für Investmentteams in Projekten aus ${sector.de}.`),
  ];
  const specialisation = copy.specialisation(sector);
  const brandedSpecialisation = t(
    `${specialisation.ru} Методика ${brandName} выделяет неопределённость отдельно от подтверждённых фактов.`,
    `${specialisation.de} Die Methodik von ${brandName} trennt Unsicherheit konsequent von bestätigten Fakten.`,
  );

  const content: GeneratedCompanyContent = {
    brandName,
    legalName: `${brandName} GmbH`,
    contact: {
      country: "DE",
      city,
      address: `${pick(random, streets)} ${addressNumber}, ${city === "Berlin" ? "10115" : city === "München" ? "80331" : city === "Frankfurt am Main" ? "60311" : city === "Hamburg" ? "20095" : "50667"} ${city}`,
      phone: `${CITY_PHONE_PREFIX[city]}0000 ${phoneTail}`,
      email: `kontakt@${asciiSlug(brandName)}.example`,
    },
    serviceType,
    size,
    history: originStories[Math.floor(random() * originStories.length)]!,
    specialisation: brandedSpecialisation,
    audience: copy.audience,
    customerProblem: copy.problem,
    product: {
      name: t(productName, productName),
      summary: copy.summary,
      inputs: copy.inputs,
      process: copy.process,
      output: copy.output,
      limitations: t(
        "Сервис не проверяет регистрацию юридических лиц, не заменяет аудит, юридическую, налоговую или финансовую экспертизу и не принимает инвестиционные решения.",
        "Der Service prüft keine Unternehmensregister, ersetzt weder Audit noch rechtliche, steuerliche oder finanzielle Beratung und trifft keine Anlageentscheidungen.",
      ),
    },
    faq: [
      { question: t("Какие материалы нужны для начала?", "Welche Unterlagen werden zum Start benötigt?"), answer: copy.inputs },
      { question: t("Как можно проверить результат?", "Wie lässt sich das Ergebnis prüfen?"), answer: t("Каждая находка сохраняет связь с исходным документом или согласованным источником и требует проверки аналитиком.", "Jedes Ergebnis bleibt mit dem Originaldokument oder einer abgestimmten Quelle verknüpft und muss durch Analysten geprüft werden.") },
      { question: t("Сервис принимает инвестиционные решения?", "Trifft der Service Anlageentscheidungen?"), answer: t("Нет. Он структурирует информацию и неопределённость; выводы и решения остаются у клиента.", "Nein. Er strukturiert Informationen und Unsicherheiten; Schlussfolgerungen und Entscheidungen bleiben beim Kunden.") },
      { question: t("Можно ли изменить критерии анализа?", "Können Analysekriterien angepasst werden?"), answer: t("Да, словари, обязательные поля и правила сравнения согласуются перед началом работы.", "Ja. Wörterbücher, Pflichtfelder und Vergleichsregeln werden vor Arbeitsbeginn abgestimmt.") },
      { question: t("Что ограничивает качество?", "Was begrenzt die Qualität?"), answer: t("Полнота, актуальность и однозначность исходных материалов; сомнительные случаи не исправляются автоматически.", "Vollständigkeit, Aktualität und Eindeutigkeit der Ausgangsmaterialien; unklare Fälle werden nicht automatisch korrigiert.") },
    ],
    team: selectedPeople.map((name, index) => ({ name, role: roles[index]!, bio: bios[index]! })),
  };

  return createProfileFromContent(content, { ...rawInput, seed }, "offline", "offline");
}
