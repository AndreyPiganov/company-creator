import { NestFactory } from "@nestjs/core";
import { config } from "dotenv";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  config({ path: "../../.env", quiet: true });
  const app = await NestFactory.create(AppModule);
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
  app.enableCors({
    origin: frontendOrigin.split(",").map((origin) => origin.trim()),
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
  });
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 4000), "0.0.0.0");
}

void bootstrap();
