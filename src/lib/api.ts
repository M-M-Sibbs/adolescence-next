"use client";

// Same-origin API base — no separate backend in the Next.js version.
const BASE = "/api";

let _token: string | null = null;

export function setToken(token: string | null) {
  _token = token;
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export function getToken(): string | null {
  if (_token) return _token;
  if (typeof window !== "undefined") {
    _token = localStorage.getItem("token");
  }
  return _token;
}

type Options = {
  method?: string;
  body?: unknown;
  isForm?: boolean;
};

async function request<T = any>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    if (opts.isForm) {
      body = opts.body as FormData; // browser sets multipart boundary
    } else {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }
  }

  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body,
  });

  // Auto-logout on 401 for non-auth endpoints
  if (res.status === 401 && !path.includes("/auth/")) {
    const onAuthPage =
      typeof window !== "undefined" &&
      (window.location.pathname === "/login" || window.location.pathname === "/register");
    if (!onAuthPage) {
      setToken(null);
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new Error(detail);
  }
  return data as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T = any>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  del: <T = any>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T = any>(path: string, form: FormData) =>
    request<T>(path, { method: "POST", body: form, isForm: true }),
  putForm: <T = any>(path: string, form: FormData) =>
    request<T>(path, { method: "PUT", body: form, isForm: true }),
};

export default api;
