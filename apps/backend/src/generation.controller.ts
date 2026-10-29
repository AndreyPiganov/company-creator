import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { publicJob } from "./common/public-job";
import { parseBody } from "./common/http";
import { GenerationService } from "./generation/generation.service";
import { companyGenerationInputSchema } from "./lib/domain/company";

@Controller()
export class GenerationController {
  constructor(private readonly generation: GenerationService) {}

  @Post("api/generation/companies")
  @HttpCode(202)
  async generate(@Body() body: unknown) {
    const input = parseBody(companyGenerationInputSchema, body, "Некорректные параметры генерации");
    const job = await this.generation.enqueue(input);
    return { job: publicJob(job) };
  }
}
