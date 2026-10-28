import { sampleCompanies } from "@/lib/generation/samples";
import { insertCompany } from "./repository";

let seedPromise: Promise<void> | undefined;

export function ensureSeedData(): Promise<void> {
  seedPromise ??= Promise.all(sampleCompanies.map((company) => insertCompany(company))).then(() => undefined);
  return seedPromise;
}
