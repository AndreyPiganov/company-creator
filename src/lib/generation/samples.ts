import type { CompanyProfile, LocalisedText } from "@/lib/domain/company";

const t = (ru: string, de: string): LocalisedText => ({ ru, de });

const disclaimer = t(
  "Это вымышленная компания и демонстрационные проектные данные. Сведения не подтверждают существование или регистрацию юридического лица.",
  "Dies ist ein fiktives Unternehmen mit Demonstrationsdaten. Die Angaben bestätigen weder die Existenz noch die Registrierung einer juristischen Person.",
);

export const sampleCompanies: CompanyProfile[] = [
  {
    schemaVersion: 1,
    id: "71fd54b4-5cc4-4b9c-8e9a-3eab62dce101",
    status: "approved",
    revision: 1,
    brandName: "Feldspar Insight",
    legalName: "Feldspar Insight GmbH",
    contact: {
      country: "DE",
      city: "Berlin",
      address: "Musterweg 14, 10115 Berlin",
      phone: "+49 30 0000 4127",
      email: "kontakt@feldspar-insight.example",
    },
    businessDirection: "b2b-ai-investment-research",
    serviceType: "investment-due-diligence",
    size: "small",
    history: t(
      "Feldspar Insight появилась в 2021 году как внутренняя исследовательская группа двух специалистов по корпоративным финансам и инженера данных. Команда превратила повторяемый процесс проверки инвестиционных материалов в отдельный аналитический сервис для небольших фондов.",
      "Feldspar Insight entstand 2021 als internes Research-Team aus zwei Fachleuten für Corporate Finance und einem Data Engineer. Das Team entwickelte seinen wiederholbaren Prüfprozess für Investmentunterlagen zu einem eigenständigen Analyseservice für kleinere Fonds.",
    ),
    specialisation: t(
      "Проверка инвестиционных меморандумов, финансовых моделей и отраслевых источников перед первым решением инвестиционного комитета.",
      "Prüfung von Investment-Memoranden, Finanzmodellen und Branchenquellen vor der ersten Entscheidung eines Investmentkomitees.",
    ),
    audience: t(
      "Небольшие венчурные и private-equity команды в Германии, которым нужна воспроизводимая первичная проверка сделок без расширения постоянного штата.",
      "Kleine Venture-Capital- und Private-Equity-Teams in Deutschland, die eine nachvollziehbare Erstprüfung von Transaktionen ohne zusätzliches festes Personal benötigen.",
    ),
    customerProblem: t(
      "Аналитики вручную сопоставляют разрозненные таблицы, презентации и внешние источники, поэтому ключевые допущения и пробелы обнаруживаются слишком поздно.",
      "Analysten gleichen verstreute Tabellen, Präsentationen und externe Quellen manuell ab, sodass zentrale Annahmen und Lücken zu spät sichtbar werden.",
    ),
    product: {
      name: t("Feldspar Review", "Feldspar Review"),
      summary: t(
        "Рабочее пространство для структурированной первичной проверки материалов сделки с указанием источников и зон неопределённости.",
        "Ein Arbeitsbereich für die strukturierte Erstprüfung von Transaktionsunterlagen mit Quellenhinweisen und transparenten Unsicherheiten.",
      ),
      inputs: t(
        "Инвестиционный меморандум, финансовая модель, таблица KPI и согласованный список открытых отраслевых источников.",
        "Investment-Memorandum, Finanzmodell, KPI-Tabelle und eine abgestimmte Liste öffentlich zugänglicher Branchenquellen.",
      ),
      process: t(
        "Сервис извлекает утверждения и показатели, связывает их с исходными фрагментами, отмечает расхождения и формирует очередь вопросов для аналитика. Каждая находка остаётся проверяемой человеком.",
        "Der Service extrahiert Aussagen und Kennzahlen, verknüpft sie mit den Originalstellen, markiert Abweichungen und erstellt eine Fragenliste für Analysten. Jede Feststellung bleibt durch Menschen prüfbar.",
      ),
      output: t(
        "Структурированный обзор допущений, карта источников, список расхождений и приоритизированные вопросы для следующего этапа due diligence.",
        "Eine strukturierte Übersicht der Annahmen, eine Quellenkarte, eine Liste der Abweichungen und priorisierte Fragen für die nächste Due-Diligence-Phase.",
      ),
      limitations: t(
        "Сервис не подтверждает юридические факты, не заменяет финансовую, налоговую или юридическую экспертизу и не принимает инвестиционные решения.",
        "Der Service bestätigt keine rechtlichen Tatsachen, ersetzt keine finanzielle, steuerliche oder juristische Prüfung und trifft keine Anlageentscheidungen.",
      ),
    },
    faq: [
      {
        id: "71fd54b4-5cc4-4b9c-8e9a-3eab62dcf101",
        question: t("Какие материалы можно анализировать?", "Welche Unterlagen können analysiert werden?"),
        answer: t(
          "PDF-презентации, текстовые документы и табличные финансовые модели в согласованной структуре. Качество результата зависит от полноты исходных материалов.",
          "PDF-Präsentationen, Textdokumente und tabellarische Finanzmodelle in einer abgestimmten Struktur. Die Ergebnisqualität hängt von der Vollständigkeit der Unterlagen ab.",
        ),
      },
      {
        id: "71fd54b4-5cc4-4b9c-8e9a-3eab62dcf102",
        question: t("Сервис принимает решение о сделке?", "Trifft der Service eine Transaktionsentscheidung?"),
        answer: t(
          "Нет. Он организует доказательства и вопросы, а оценку и решение сохраняет инвестиционная команда.",
          "Nein. Er strukturiert Nachweise und Fragen; Bewertung und Entscheidung bleiben beim Investmentteam.",
        ),
      },
      {
        id: "71fd54b4-5cc4-4b9c-8e9a-3eab62dcf103",
        question: t("Как проверяются выводы?", "Wie werden Ergebnisse geprüft?"),
        answer: t(
          "Каждый вывод связан с исходным фрагментом и помечен уровнем уверенности, чтобы аналитик мог проверить его вручную.",
          "Jedes Ergebnis ist mit der Originalstelle und einem Konfidenzhinweis verknüpft, damit Analysten es manuell prüfen können.",
        ),
      },
      {
        id: "71fd54b4-5cc4-4b9c-8e9a-3eab62dcf104",
        question: t("Можно ли изменить критерии проверки?", "Lassen sich Prüfkriterien anpassen?"),
        answer: t(
          "Да, команда согласует набор проверок и обязательные поля перед началом проекта.",
          "Ja. Das Team stimmt Prüfregeln und Pflichtfelder vor Projektbeginn ab.",
        ),
      },
      {
        id: "71fd54b4-5cc4-4b9c-8e9a-3eab62dcf105",
        question: t("Что не входит в результат?", "Was ist nicht Bestandteil des Ergebnisses?"),
        answer: t(
          "Юридическое заключение, аудит отчётности, прогноз доходности и рекомендация купить или продать актив.",
          "Nicht enthalten sind Rechtsgutachten, Jahresabschlussprüfungen, Renditeprognosen sowie Kauf- oder Verkaufsempfehlungen.",
        ),
      },
    ],
    team: [
      {
        id: "71fd54b4-5cc4-4b9c-8e9a-3eab62dca101",
        name: "Mara Vogel",
        role: t("Управляющий директор", "Geschäftsführerin"),
        bio: t(
          "До основания компании десять лет сопровождала сделки среднего рынка и выстраивала процессы инвестиционных комитетов.",
          "Vor der Gründung begleitete sie zehn Jahre lang Mid-Market-Transaktionen und entwickelte Prozesse für Investmentkomitees.",
        ),
        photo: { asset: "/assets/team/team-warm.png", position: 0, alt: t("Портрет Мары Фогель", "Porträt von Mara Vogel") },
      },
      {
        id: "71fd54b4-5cc4-4b9c-8e9a-3eab62dca102",
        name: "Jonas Kern",
        role: t("Руководитель исследований", "Leiter Research"),
        bio: t(
          "Специализируется на отраслевом анализе и проверке коммерческих допущений для технологических компаний.",
          "Er spezialisiert sich auf Branchenanalysen und die Prüfung kommerzieller Annahmen bei Technologieunternehmen.",
        ),
        photo: { asset: "/assets/team/team-warm.png", position: 1, alt: t("Портрет Йонаса Керна", "Porträt von Jonas Kern") },
      },
      {
        id: "71fd54b4-5cc4-4b9c-8e9a-3eab62dca103",
        name: "Lea Hartmann",
        role: t("Руководитель продукта", "Leiterin Produkt"),
        bio: t(
          "Проектирует аналитические рабочие процессы и отвечает за то, чтобы автоматизация оставалась объяснимой для пользователя.",
          "Sie gestaltet analytische Arbeitsabläufe und stellt sicher, dass Automatisierung für Nutzer nachvollziehbar bleibt.",
        ),
        photo: { asset: "/assets/team/team-warm.png", position: 2, alt: t("Портрет Леи Хартманн", "Porträt von Lea Hartmann") },
      },
      {
        id: "71fd54b4-5cc4-4b9c-8e9a-3eab62dca104",
        name: "David Lorenz",
        role: t("Инженер данных", "Data Engineer"),
        bio: t(
          "Разрабатывает конвейеры извлечения данных и проверки происхождения показателей в смешанных наборах документов.",
          "Er entwickelt Pipelines zur Datenextraktion und Herkunftsprüfung von Kennzahlen in heterogenen Dokumentbeständen.",
        ),
        photo: { asset: "/assets/team/team-warm.png", position: 3, alt: t("Портрет Давида Лоренца", "Porträt von David Lorenz") },
      },
      {
        id: "71fd54b4-5cc4-4b9c-8e9a-3eab62dca105",
        name: "Nina Reuter",
        role: t("Старший аналитик", "Senior Analystin"),
        bio: t(
          "Проверяет финансовые модели, формулирует исследовательские вопросы и ведёт контроль качества итоговых обзоров.",
          "Sie prüft Finanzmodelle, formuliert Research-Fragen und verantwortet die Qualitätssicherung der Ergebnisberichte.",
        ),
        photo: { asset: "/assets/team/team-warm.png", position: 4, alt: t("Портрет Нины Ройтер", "Porträt von Nina Reuter") },
      },
    ],
    disclaimer,
    generation: {
      mode: "sample",
      provider: null,
      model: null,
      seed: "sample-feldspar-2026",
      generatedAt: "2026-10-28T12:00:00.000Z",
    },
  },
  {
    schemaVersion: 1,
    id: "82ae65c5-6dd5-4cad-9fab-4fbc73edf202",
    status: "approved",
    revision: 1,
    brandName: "Vektorhain Analytics",
    legalName: "Vektorhain Analytics GmbH",
    contact: {
      country: "DE",
      city: "München",
      address: "Beispielallee 8, 80331 München",
      phone: "+49 89 0000 7634",
      email: "dialog@vektorhain.example",
    },
    businessDirection: "b2b-ai-investment-research",
    serviceType: "portfolio-monitoring",
    size: "medium",
    history: t(
      "Vektorhain Analytics была основана в 2018 году командой специалистов по управлению рисками и обработке корпоративных данных. Первые проекты были посвящены раннему обнаружению изменений в портфельных компаниях промышленного сектора.",
      "Vektorhain Analytics wurde 2018 von Fachleuten für Risikomanagement und Unternehmensdaten gegründet. Die ersten Projekte konzentrierten sich auf die frühzeitige Erkennung von Veränderungen bei industriellen Portfoliounternehmen.",
    ),
    specialisation: t(
      "Непрерывный мониторинг операционных сигналов портфельных компаний и подготовка сопоставимых обзоров для управляющих фондами.",
      "Kontinuierliches Monitoring operativer Signale von Portfoliounternehmen und Erstellung vergleichbarer Übersichten für Fondsmanager.",
    ),
    audience: t(
      "Немецкие инвестиционные компании среднего размера с несколькими отраслевыми портфелями и регулярной отчётностью от управляющих команд.",
      "Mittelgroße deutsche Investmentgesellschaften mit mehreren Branchenportfolios und regelmäßiger Berichterstattung durch Managementteams.",
    ),
    customerProblem: t(
      "Отчёты поступают в разных форматах и с разной периодичностью, поэтому изменения показателей сложно заметить и сопоставить до квартального обзора.",
      "Berichte treffen in unterschiedlichen Formaten und Rhythmen ein. Veränderungen bei Kennzahlen lassen sich deshalb vor dem Quartalsreview nur schwer erkennen und vergleichen.",
    ),
    product: {
      name: t("Vektorhain Signalboard", "Vektorhain Signalboard"),
      summary: t(
        "Аналитический слой, который приводит регулярные отчёты портфельных компаний к общей структуре и показывает изменения с источниками.",
        "Eine Analyseschicht, die regelmäßige Berichte von Portfoliounternehmen vereinheitlicht und Veränderungen mit Quellenbezug sichtbar macht.",
      ),
      inputs: t(
        "Утверждённые управленческие отчёты, таблицы KPI, комментарии руководства и заранее выбранные внешние отраслевые ряды.",
        "Freigegebene Managementberichte, KPI-Tabellen, Kommentare der Geschäftsleitung und vorab ausgewählte externe Branchenreihen.",
      ),
      process: t(
        "Данные нормализуются по единому словарю, сравниваются с предыдущими периодами и правилами портфеля, после чего система формирует объяснимые сигналы для проверки аналитиком.",
        "Die Daten werden anhand eines gemeinsamen Wörterbuchs normalisiert, mit Vorperioden und Portfolioregeln verglichen und anschließend als erklärbare Signale zur Prüfung durch Analysten aufbereitet.",
      ),
      output: t(
        "Единая лента изменений, карточки показателей, ссылки на исходные отчёты и список вопросов для разговора с руководством компании.",
        "Ein einheitlicher Änderungsfeed, Kennzahlenkarten, Verweise auf Originalberichte und eine Fragenliste für Gespräche mit dem Unternehmensmanagement.",
      ),
      limitations: t(
        "Результаты зависят от своевременности и качества предоставленных отчётов. Сервис не является системой бухгалтерского учёта, аудитом или прогнозом доходности.",
        "Die Ergebnisse hängen von Aktualität und Qualität der bereitgestellten Berichte ab. Der Service ist weder Buchhaltungssystem noch Audit oder Renditeprognose.",
      ),
    },
    faq: [
      {
        id: "82ae65c5-6dd5-4cad-9fab-4fbc73edf2f1",
        question: t("Какие периоды можно сравнивать?", "Welche Zeiträume können verglichen werden?"),
        answer: t(
          "Месячные и квартальные периоды, если показатели определены одинаково и источники доступны для проверки.",
          "Monats- und Quartalszeiträume, sofern Kennzahlen einheitlich definiert und Quellen prüfbar sind.",
        ),
      },
      {
        id: "82ae65c5-6dd5-4cad-9fab-4fbc73edf2f2",
        question: t("Система заменяет отчётность компании?", "Ersetzt das System die Unternehmensberichterstattung?"),
        answer: t(
          "Нет. Она организует копии утверждённых отчётов и помогает сравнивать их, но не создаёт официальную отчётность.",
          "Nein. Es strukturiert Kopien freigegebener Berichte und erleichtert Vergleiche, erstellt aber keine offizielle Berichterstattung.",
        ),
      },
      {
        id: "82ae65c5-6dd5-4cad-9fab-4fbc73edf2f3",
        question: t("Почему сигнал требует проверки?", "Warum muss ein Signal geprüft werden?"),
        answer: t(
          "Изменение может объясняться методикой расчёта или контекстом. Система показывает источник, а окончательную интерпретацию делает аналитик.",
          "Eine Veränderung kann durch Berechnungsmethoden oder Kontext entstehen. Das System zeigt die Quelle; die endgültige Interpretation übernimmt ein Analyst.",
        ),
      },
      {
        id: "82ae65c5-6dd5-4cad-9fab-4fbc73edf2f4",
        question: t("Можно ли использовать собственный словарь KPI?", "Kann ein eigenes KPI-Wörterbuch genutzt werden?"),
        answer: t(
          "Да, словарь и правила сопоставления согласуются для каждого портфеля отдельно.",
          "Ja. Wörterbuch und Zuordnungsregeln werden für jedes Portfolio separat abgestimmt.",
        ),
      },
      {
        id: "82ae65c5-6dd5-4cad-9fab-4fbc73edf2f5",
        question: t("Какие решения остаются у клиента?", "Welche Entscheidungen verbleiben beim Kunden?"),
        answer: t(
          "Оценка причин изменений, коммуникация с менеджментом и любые инвестиционные или операционные решения.",
          "Die Bewertung von Ursachen, die Kommunikation mit dem Management sowie sämtliche Investment- und Betriebsentscheidungen.",
        ),
      },
    ],
    team: [
      {
        id: "82ae65c5-6dd5-4cad-9fab-4fbc73eda201",
        name: "Sofia Neumann",
        role: t("Управляющий директор", "Geschäftsführerin"),
        bio: t(
          "Ранее руководила программами операционного мониторинга в инвестиционной компании и внедряла единые стандарты портфельной отчётности.",
          "Zuvor leitete sie Programme für operatives Monitoring bei einer Investmentgesellschaft und etablierte einheitliche Standards für Portfolioberichte.",
        ),
        photo: { asset: "/assets/team/team-cool.png", position: 0, alt: t("Портрет Софии Нойманн", "Porträt von Sofia Neumann") },
      },
      {
        id: "82ae65c5-6dd5-4cad-9fab-4fbc73eda202",
        name: "Markus Adler",
        role: t("Руководитель аналитики", "Leiter Analytics"),
        bio: t(
          "Пятнадцать лет работает с рисками и показателями промышленных компаний, отвечает за методики сравнения и контроль интерпретаций.",
          "Er arbeitet seit fünfzehn Jahren mit Risiken und Kennzahlen von Industrieunternehmen und verantwortet Vergleichsmethoden sowie Interpretationskontrollen.",
        ),
        photo: { asset: "/assets/team/team-cool.png", position: 1, alt: t("Портрет Маркуса Адлера", "Porträt von Markus Adler") },
      },
      {
        id: "82ae65c5-6dd5-4cad-9fab-4fbc73eda203",
        name: "Clara Weiss",
        role: t("Руководитель данных", "Leiterin Daten"),
        bio: t(
          "Создаёт модели данных для неоднородной управленческой отчётности и процессы отслеживания происхождения каждого показателя.",
          "Sie entwickelt Datenmodelle für heterogene Managementberichte und Prozesse zur Nachverfolgung der Herkunft jeder Kennzahl.",
        ),
        photo: { asset: "/assets/team/team-cool.png", position: 2, alt: t("Портрет Клары Вайс", "Porträt von Clara Weiss") },
      },
      {
        id: "82ae65c5-6dd5-4cad-9fab-4fbc73eda204",
        name: "Tobias Engel",
        role: t("Ведущий инженер", "Lead Engineer"),
        bio: t(
          "Отвечает за надёжность конвейеров обработки документов, журналирование изменений и воспроизводимость расчётов.",
          "Er verantwortet zuverlässige Dokumentenpipelines, Änderungsprotokolle und die Reproduzierbarkeit von Berechnungen.",
        ),
        photo: { asset: "/assets/team/team-cool.png", position: 3, alt: t("Портрет Тобиаса Энгеля", "Porträt von Tobias Engel") },
      },
      {
        id: "82ae65c5-6dd5-4cad-9fab-4fbc73eda205",
        name: "Henrik Baum",
        role: t("Директор по работе с клиентами", "Leiter Kundenprojekte"),
        bio: t(
          "Переводит требования инвестиционных команд в измеримые правила мониторинга и сопровождает внедрение в портфелях.",
          "Er übersetzt Anforderungen von Investmentteams in messbare Monitoring-Regeln und begleitet die Einführung in Portfolios.",
        ),
        photo: { asset: "/assets/team/team-cool.png", position: 4, alt: t("Портрет Хенрика Баума", "Porträt von Henrik Baum") },
      },
    ],
    disclaimer,
    generation: {
      mode: "sample",
      provider: null,
      model: null,
      seed: "sample-vektorhain-2026",
      generatedAt: "2026-10-28T12:05:00.000Z",
    },
  },
];
