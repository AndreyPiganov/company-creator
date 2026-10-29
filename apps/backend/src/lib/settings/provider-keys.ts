import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

export const providerIdSchema = z.enum(["openai", "openrouter"]);
export type ConfigurableProvider = z.infer<typeof providerIdSchema>;
export const apiKeySchema = z.string().trim().min(10).max(1024).regex(/^[\x21-\x7e]+$/);
const keysSchema = z.object({ openai: apiKeySchema.optional(), openrouter: apiKeySchema.optional() });
const envNames = { openai: "OPENAI_API_KEY", openrouter: "OPENROUTER_API_KEY" } as const;
const knownSecrets = new Set<string>();
let pendingWrite: Promise<unknown> = Promise.resolve();

function storagePath() {
  return path.resolve(process.env.SETTINGS_PATH || path.join(process.cwd(), "data", "settings"), "provider-keys.json");
}

async function readKeys(): Promise<z.infer<typeof keysSchema>> {
  try {
    const keys = keysSchema.parse(JSON.parse(await readFile(storagePath(), "utf8")));
    Object.values(keys).forEach((key) => { if (key) knownSecrets.add(key); });
    return keys;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw new Error("Не удалось прочитать настройки провайдеров");
  }
}

export async function getProviderKey(provider: ConfigurableProvider): Promise<string | undefined> {
  const keys = await readKeys();
  const key = keys[provider] || process.env[envNames[provider]];
  if (key) knownSecrets.add(key);
  return key;
}

export async function providerKeyStatuses() {
  const keys = await readKeys();
  return (["openai", "openrouter"] as const).map((id) => ({
    id,
    configured: Boolean(keys[id] || process.env[envNames[id]]),
    source: keys[id] ? "panel" : process.env[envNames[id]] ? "environment" : "none",
    environmentConfigured: Boolean(process.env[envNames[id]]),
  }));
}

export async function saveProviderKey(provider: ConfigurableProvider, key: string | null) {
  const validated = key === null ? null : apiKeySchema.parse(key);
  if (validated) knownSecrets.add(validated);
  const operation = pendingWrite.then(async () => {
    const keys = await readKeys();
    if (validated === null) delete keys[provider];
    else keys[provider] = validated;
    const destination = storagePath();
    const temporary = `${destination}.${crypto.randomUUID()}.tmp`;
    await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
    try {
      await writeFile(temporary, JSON.stringify(keysSchema.parse(keys)), { mode: 0o600, flag: "wx" });
      await rename(temporary, destination);
    } finally { await rm(temporary, { force: true }); }
  });
  pendingWrite = operation.catch(() => undefined);
  await operation;
}

export function redactSecrets(message: string) {
  for (const name of Object.values(envNames)) {
    const key = process.env[name];
    if (key) knownSecrets.add(key);
  }
  let safe = message;
  for (const key of knownSecrets) safe = safe.split(key).join("[REDACTED]");
  return safe;
}
