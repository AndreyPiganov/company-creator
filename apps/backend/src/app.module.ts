import { Module } from "@nestjs/common";
import { CompaniesController } from "./companies.controller";
import { DatabaseModule } from "./database/database.module";
import { GenerationController } from "./generation.controller";
import { GenerationService } from "./generation/generation.service";
import { HealthController } from "./health.controller";
import { JobsController } from "./jobs.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { ProvidersController } from "./providers.controller";
import { SeedService } from "./seed/seed.service";
import { SitesController } from "./sites.controller";
import { SitesService } from "./sites/sites.service";
import { PhotosController } from "./photos.controller";

@Module({
  imports: [
    PrismaModule,
    DatabaseModule,
  ],
  controllers: [
    HealthController,
    ProvidersController,
    JobsController,
    GenerationController,
    CompaniesController,
    SitesController,
    PhotosController,
  ],
  providers: [SeedService, GenerationService, SitesService],
})
export class AppModule {}
