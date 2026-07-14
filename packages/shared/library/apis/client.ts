import { apiError } from "../functions/api-error";

export type ApiMethod = "get" | "post" | "put" | "patch" | "delete";

interface ApiConfig {
  baseUrl: string;
  refreshPath?: string;
  onUnauthorized?: () => void;
}

const config: ApiConfig = { baseUrl: "" };

export function configureApi(next: Partial<ApiConfig>): void {
  Object.assign(config, next);
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

function expiresSoon(token: string): boolean {
  try {
    const payload = token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return !exp || exp * 1000 - Date.now() < 30_000;
  } catch {
    return true;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  if (accessToken && !expiresSoon(accessToken)) return accessToken;
  return (await refresh()) ? accessToken : null;
}

export function apiUrl(apiModule: string, lastUrl?: string): string {
  const path = [apiModule, lastUrl].filter(Boolean).join("/");
  return `${config.baseUrl.replace(/\/+$/, "")}/${path}`;
}

let refreshing: Promise<boolean> | null = null;

function refresh(): Promise<boolean> {
  if (!config.refreshPath) return Promise.resolve(false);
  refreshing ??= fetch(`${config.baseUrl.replace(/\/+$/, "")}${config.refreshPath}`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken?: string };
      if (!data.accessToken) return false;
      accessToken = data.accessToken;
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

function isAuthUrl(url: string): boolean {
  const path = config.refreshPath;
  if (!path) return false;
  const prefix = path.replace(/[^/]+$/, "");
  return prefix ? url.includes(prefix) : url.includes(path);
}

function messageOf(data: unknown, status: number): string {
  if (data && typeof data === "object" && "message" in data) {
    const { message } = data as { message: unknown };
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.map(String).join(", ");
  }
  return `Request failed with status ${status}`;
}

export async function apiRequest<T>(
  method: ApiMethod,
  url: string,
  body?: unknown,
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method: method.toUpperCase(),
    headers,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && retry && config.refreshPath && !isAuthUrl(url)) {
    if (await refresh()) return apiRequest<T>(method, url, body, false);
    config.onUnauthorized?.();
  }

  const data =
    res.status === 204
      ? undefined
      : res.headers.get("content-type")?.includes("application/json")
        ? await res.json()
        : await res.text();

  if (!res.ok) throw apiError(res.status, messageOf(data, res.status), data);
  return data as T;
}
