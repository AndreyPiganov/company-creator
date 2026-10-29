import { Controller, Get } from "@nestjs/common";
import { RepositoryService } from "./database/repository.service";
import { SeedService } from "./seed/seed.service";

@Controller()
export class HealthController {
  constructor(
    private readonly repository: RepositoryService,
    private readonly seed: SeedService,
  ) {}

  @Get("api/health")
  async health() {
    await this.repository.checkConnection();
    await this.seed.ensureSeedData();
    return { status: "ok", database: "ready" };
  }
}
