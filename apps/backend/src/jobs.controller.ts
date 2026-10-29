import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { publicJob } from "./common/public-job";
import { RepositoryService } from "./database/repository.service";

@Controller()
export class JobsController {
  constructor(private readonly repository: RepositoryService) {}

  @Get("api/jobs/:id")
  async getJob(@Param("id") id: string) {
    const job = await this.repository.getJob(id);
    if (!job) throw new NotFoundException({ error: "Задача не найдена" });
    return { job: publicJob(job) };
  }
}
