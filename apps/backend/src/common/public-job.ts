import type { GenerationJob } from "../database/repository.service";

export function publicJob(job: GenerationJob) {
  const { input, ...result } = job;
  void input;
  return result;
}
