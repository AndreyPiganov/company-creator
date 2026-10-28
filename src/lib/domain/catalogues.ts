import type { CompanyProfile } from "./company";

export const CITY_PHONE_PREFIX: Record<CompanyProfile["contact"]["city"], string> = {
  Berlin: "+49 30 ",
  München: "+49 89 ",
  "Frankfurt am Main": "+49 69 ",
  Hamburg: "+49 40 ",
  Köln: "+49 221 ",
};

export const SERVICE_LABELS: Record<CompanyProfile["serviceType"], { ru: string; de: string }> = {
  "investment-due-diligence": {
    ru: "Инвестиционный due diligence",
    de: "Investment Due Diligence",
  },
  "market-intelligence": {
    ru: "Рыночная аналитика",
    de: "Market Intelligence",
  },
  "portfolio-monitoring": {
    ru: "Мониторинг портфеля",
    de: "Portfolio-Monitoring",
  },
  "document-data-analysis": {
    ru: "Анализ документов и данных",
    de: "Dokumenten- und Datenanalyse",
  },
};

export const SIZE_LABELS: Record<CompanyProfile["size"], { ru: string; de: string }> = {
  small: { ru: "Небольшая", de: "Klein" },
  medium: { ru: "Средняя", de: "Mittelständisch" },
};
