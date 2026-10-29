import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UnprocessableEntityException,
} from "@nestjs/common";
import type { Response } from "express";
import { publicJob } from "./common/public-job";
import { RepositoryService } from "./database/repository.service";
import { assertValidCompany } from "./lib/domain/validate";
import { safeErrorMessage } from "./lib/http";
import { SeedService } from "./seed/seed.service";
import { SitesService } from "./sites/sites.service";

function fileName(brand: string): string {
  const slug = brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "company";
  return `${slug}.json`;
}

@Controller()
export class CompaniesController {
  constructor(
    private readonly repository: RepositoryService,
    private readonly seed: SeedService,
    private readonly sites: SitesService,
  ) {}

  @Get("api/companies")
  async list() {
    await this.seed.ensureSeedData();
    return { companies: await this.repository.listCompanies() };
  }

  @Post("api/companies")
  async create(@Body() body: unknown) {
    try {
      const company = assertValidCompany(body);
      await this.repository.insertCompany(company);
      return { company };
    } catch (error) {
      throw new UnprocessableEntityException({ error: "Не удалось сохранить компанию", details: safeErrorMessage(error) });
    }
  }

  @Get("api/companies/:id")
  async get(@Param("id") id: string) {
    await this.seed.ensureSeedData();
    const company = await this.repository.getCompany(id);
    if (!company) throw new NotFoundException({ error: "Компания не найдена" });
    return { company };
  }

  @Patch("api/companies/:id")
  async update(@Param("id") id: string, @Body() body: unknown) {
    try {
      const company = await this.repository.updateCompany(id, body);
      if (!company) throw new NotFoundException({ error: "Компания не найдена" });
      return { company };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      const issues = (error as Error & { issues?: unknown }).issues;
      throw new UnprocessableEntityException({
        error: "Карточка не прошла проверку",
        details: issues ?? safeErrorMessage(error),
      });
    }
  }

  @Post("api/companies/:id/approve")
  @HttpCode(200)
  async approve(@Param("id") id: string) {
    const company = await this.repository.approveCompany(id);
    if (!company) throw new NotFoundException({ error: "Компания не найдена" });
    return { company };
  }

  @Get("api/companies/:id/export")
  async export(@Param("id") id: string, @Res() response: Response): Promise<void> {
    const company = await this.repository.getCompany(id);
    if (!company) throw new NotFoundException({ error: "Компания не найдена" });
    response.set({
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${fileName(company.brandName)}"`,
      "cache-control": "no-store",
    });
    response.send(`${JSON.stringify(company, null, 2)}\n`);
  }

  @Get("api/companies/:id/sites")
  async listSites(@Param("id") id: string) {
    const sites = await this.sites.list(id);
    return {
      sites: sites.map(({ artifactPath, snapshotJson, ...site }) => {
        void artifactPath;
        void snapshotJson;
        return site;
      }),
    };
  }

  @Post("api/companies/:id/sites")
  @HttpCode(202)
  async createSite(@Param("id") id: string, @Body() body: unknown) {
    const company = await this.repository.getCompany(id);
    if (!company) throw new NotFoundException({ error: "Компания не найдена" });
    if (company.status !== "approved") {
      throw new ConflictException({ error: "Сначала утвердите карточку компании" });
    }
    const input = this.sites.parseInput(body);
    const job = await this.sites.enqueue(id, input);
    return { job: publicJob(job) };
  }
}
