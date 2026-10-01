import type { User } from "../types";

const ACCESS_KEY = "storyhub_access_token";
const REFRESH_KEY = "storyhub_refresh_token";
const USER_KEY = "storyhub_user";

type RawUser = Partial<User> & Record<string, unknown>;

function sanitizeUser(raw?: RawUser | null): User | null {
  if (!raw || raw.id == null || !raw.username) return null;
  return {
    id: Number(raw.id),
    username: String(raw.username),
    name: String(raw.name || raw.username),
    email: raw.email ? String(raw.email) : undefined,
    role: raw.role ? String(raw.role) : undefined,
    bio: raw.bio ? String(raw.bio) : undefined,
    profile_img: raw.profile_img ? String(raw.profile_img) : null,
  };
}

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  get user(): User | null {
    try {
      return sanitizeUser(JSON.parse(localStorage.getItem(USER_KEY) || "null"));
    } catch {
      return null;
    }
  },
  setSession(access: string, refresh: string | undefined, user?: RawUser) {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    const safe = sanitizeUser(user);
    if (safe) localStorage.setItem(USER_KEY, JSON.stringify(safe));
  },
  setUser(user: RawUser) {
    const safe = sanitizeUser(user);
    if (safe) localStorage.setItem(USER_KEY, JSON.stringify(safe));
    else localStorage.removeItem(USER_KEY);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

function joinPath(path: string) {
  return `/api/${path.replace(/^\//, "")}`;
}

async function rawFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  const token = tokenStore.access;
  if (token && !headers.has("Authorization"))
    headers.set("Authorization", `Bearer ${token}`);
  return fetch(joinPath(path), { ...init, headers });
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refresh = tokenStore.refresh;
    if (!refresh) return false;
    try {
      const res = await fetch(joinPath("/refresh"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) {
        tokenStore.clear();
        return false;
      }
      const json = await res.json();
      if (!json.access_token) {
        tokenStore.clear();
        return false;
      }
      tokenStore.setSession(json.access_token, json.refresh_token || refresh);
      return true;
    } catch {
      tokenStore.clear();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const res = await rawFetch(path, init);
  if (
    res.status === 401 &&
    retry &&
    tokenStore.refresh &&
    !path.includes("/login") &&
    !path.includes("/refresh")
  ) {
    if (await tryRefresh()) return api<T>(path, init, false);
  }
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok)
    throw new Error(
      body?.message || body?.error || `Request gagal (${res.status})`,
    );
  return body as T;
}

export async function apiMultipart<T = unknown>(
  path: string,
  form: FormData,
  method: "POST" | "PUT" = "POST",
) {
  return api<T>(path, { method, body: form });
}
