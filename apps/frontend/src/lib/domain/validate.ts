import { CITY_PHONE_PREFIX } from "./catalogues";
import { companyProfileSchema, type CompanyProfile, type LocalisedText } from "./company";

export type ValidationIssue = {
  path: string;
  message: string;
};

const PLACEHOLDER_PATTERN = /\{\{[^}]+\}\}|\[[A-ZА-Я0-9_ -]{3,}\]|TODO|LOREM IPSUM/i;

function inspectLocalisedText(value: LocalisedText, path: string, issues: ValidationIssue[]) {
  for (const language of ["ru", "de"] as const) {
    if (PLACEHOLDER_PATTERN.test(value[language])) {
      issues.push({ path: `${path}.${language}`, message: "Обнаружен незаменённый шаблон" });
    }
  }
}

export function validateCompanyConsistency(input: unknown): { profile?: CompanyProfile; issues: ValidationIssue[] } {
  const parsed = companyProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  const profile = parsed.data;
  const issues: ValidationIssue[] = [];
  const expectedPrefix = CITY_PHONE_PREFIX[profile.contact.city];
  if (!profile.contact.phone.startsWith(expectedPrefix)) {
    issues.push({
      path: "contact.phone",
      message: `Телефон должен начинаться с кода города ${expectedPrefix.trim()}`,
    });
  }

  const names = profile.team.map((member) => member.name.toLocaleLowerCase("de"));
  if (new Set(names).size !== names.length) {
    issues.push({ path: "team", message: "Имена сотрудников должны быть уникальны" });
  }

  const ids = [...profile.team.map((member) => member.id), ...profile.faq.map((item) => item.id)];
  if (new Set(ids).size !== ids.length) {
    issues.push({ path: "team", message: "Внутренние идентификаторы должны быть уникальны" });
  }

  const localised: Array<[string, LocalisedText]> = [
    ["history", profile.history],
    ["specialisation", profile.specialisation],
    ["audience", profile.audience],
    ["customerProblem", profile.customerProblem],
    ["product.name", profile.product.name],
    ["product.summary", profile.product.summary],
    ["product.inputs", profile.product.inputs],
    ["product.process", profile.product.process],
    ["product.output", profile.product.output],
    ["product.limitations", profile.product.limitations],
    ["disclaimer", profile.disclaimer],
  ];

  profile.team.forEach((member, index) => {
    localised.push([`team.${index}.role`, member.role]);
    localised.push([`team.${index}.bio`, member.bio]);
    localised.push([`team.${index}.photo.alt`, member.photo.alt]);
  });
  profile.faq.forEach((item, index) => {
    localised.push([`faq.${index}.question`, item.question]);
    localised.push([`faq.${index}.answer`, item.answer]);
  });
  localised.forEach(([path, value]) => inspectLocalisedText(value, path, issues));

  return issues.length > 0 ? { issues } : { profile, issues };
}

export function assertValidCompany(input: unknown): CompanyProfile {
  const result = validateCompanyConsistency(input);
  if (!result.profile || result.issues.length > 0) {
    const detail = result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Company profile is invalid: ${detail}`);
  }
  return result.profile;
}
