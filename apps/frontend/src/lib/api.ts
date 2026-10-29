export class ApiResponseError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export type SiteSummary = {
  id: string;
  companyId: string;
  version: number;
  language: "ru" | "de";
  theme: "forest" | "midnight" | "sand" | "berry";
  checksum: string;
  createdAt: string;
};

function trimSlash(value: string): string {
  return value.replace(/\/$/, "");
}

export function browserApiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return `${trimSlash(base)}${path.startsWith("/") ? path : `/${path}`}`;
}

export function serverApiUrl(path: string): string {
  const base = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return `${trimSlash(base)}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(serverApiUrl(path), { cache: "no-store" });
  if (!response.ok) {
    let message = `Backend returned ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      message = payload.error || payload.message || message;
    } catch {
      // The status and safe generic message are enough when the body is not JSON.
    }
    throw new ApiResponseError(response.status, message);
  }
  return response.json() as Promise<T>;
}
