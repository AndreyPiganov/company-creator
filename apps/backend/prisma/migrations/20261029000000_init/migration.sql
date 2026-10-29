CREATE TYPE "CompanyStatus" AS ENUM ('draft', 'approved');
CREATE TYPE "SiteLanguage" AS ENUM ('ru', 'de');
CREATE TYPE "SiteTheme" AS ENUM ('forest', 'midnight', 'sand', 'berry');
CREATE TYPE "JobKind" AS ENUM ('company', 'site');

CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "brand_name" TEXT NOT NULL,
    "status" "CompanyStatus" NOT NULL,
    "revision" INTEGER NOT NULL,
    "profile_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_versions" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "language" "SiteLanguage" NOT NULL,
    "theme" "SiteTheme" NOT NULL,
    "snapshot_json" JSONB NOT NULL,
    "artifact_path" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "generation_jobs" (
    "id" UUID NOT NULL,
    "kind" "JobKind" NOT NULL,
    "state" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "cost_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "input_json" JSONB NOT NULL,
    "result_id" UUID,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "generation_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "companies_status_idx" ON "companies"("status");
CREATE INDEX "companies_updated_idx" ON "companies"("updated_at");
CREATE UNIQUE INDEX "site_company_version_unique" ON "site_versions"("company_id", "version");
CREATE INDEX "site_company_idx" ON "site_versions"("company_id");
CREATE INDEX "jobs_state_idx" ON "generation_jobs"("state");
CREATE INDEX "jobs_updated_idx" ON "generation_jobs"("updated_at");

ALTER TABLE "site_versions"
ADD CONSTRAINT "site_versions_company_id_fkey"
FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
