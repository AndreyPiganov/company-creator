import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const companies = sqliteTable(
  "companies",
  {
    id: text("id").primaryKey(),
    brandName: text("brand_name").notNull(),
    status: text("status", { enum: ["draft", "approved"] }).notNull(),
    revision: integer("revision").notNull(),
    profileJson: text("profile_json").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    approvedAt: text("approved_at"),
  },
  (table) => [index("companies_status_idx").on(table.status), index("companies_updated_idx").on(table.updatedAt)],
);

export const siteVersions = sqliteTable(
  "site_versions",
  {
    id: text("id").primaryKey(),
    companyId: text("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    language: text("language", { enum: ["ru", "de"] }).notNull(),
    theme: text("theme", { enum: ["forest", "midnight", "sand", "berry"] }).notNull(),
    snapshotJson: text("snapshot_json").notNull(),
    artifactPath: text("artifact_path").notNull(),
    checksum: text("checksum").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("site_company_version_unique").on(table.companyId, table.version),
    index("site_company_idx").on(table.companyId),
  ],
);

export const generationJobs = sqliteTable(
  "generation_jobs",
  {
    id: text("id").primaryKey(),
    kind: text("kind", { enum: ["company", "site"] }).notNull(),
    state: text("state").notNull(),
    attempt: integer("attempt").notNull().default(0),
    costUsd: real("cost_usd").notNull().default(0),
    inputJson: text("input_json").notNull(),
    resultId: text("result_id"),
    error: text("error"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("jobs_state_idx").on(table.state), index("jobs_updated_idx").on(table.updatedAt)],
);

export type CompanyRow = typeof companies.$inferSelect;
export type SiteVersionRow = typeof siteVersions.$inferSelect;
export type GenerationJobRow = typeof generationJobs.$inferSelect;
