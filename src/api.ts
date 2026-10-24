const BASE: string = import.meta.env.VITE_API_URL || "http://localhost:3000";
const TOKEN_KEY = "mt_token";

// ---------- Types ----------
export type Role = "end_user" | "counsellor" | "admin";

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  country_code: string | null;
  role: Role;
}

export interface SignupFields {
  full_name: string;
  email: string;
  country_code: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

interface UserResponse {
  user: User;
}

interface ErrorBody {
  errors?: string[];
  error?: string;
}

// One error type for every failed API call, so forms can show `err.messages`.
export class ApiError extends Error {
  messages: string[];
  status?: number;

  constructor(messages: string[], status?: number) {
    super(messages[0] ?? "Request failed");
    this.name = "ApiError";
    this.messages = messages;
    this.status = status;
  }
}

export function errorMessages(err: unknown, fallback: string): string[] {
  return err instanceof ApiError ? err.messages : [fallback];
}

// ---------- Token storage ----------
// localStorage can throw (private windows, blocked storage), so every call is guarded.
export const tokenStore = {
  get(): string | null {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(token: string): void {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
  },
  clear(): void {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  },
};

// ---------- Request helper ----------
interface RequestOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
}

async function request<T>(path: string, { method = "GET", body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(["Cannot reach the server. Is the Rails API running?"]);
  }

  // Rails (devise-jwt) sends a fresh token in this header on signup and login.
  const auth = res.headers.get("Authorization");
  if (auth) tokenStore.set(auth.replace(/^Bearer\s+/i, ""));

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (data ?? {}) as ErrorBody;
    throw new ApiError(err.errors ?? (err.error ? [err.error] : ["Something went wrong"]), res.status);
  }
  return data as T;
}

// ---------- Endpoints ----------
export const api = {
  signup: (user: SignupFields) =>
    request<UserResponse>("/api/v1/signup", { method: "POST", body: { user } }),
  login: (email: string, password: string) =>
    request<UserResponse>("/api/v1/login", { method: "POST", body: { user: { email, password } } }),
  logout: () => request<{ message: string }>("/api/v1/logout", { method: "DELETE" }),
  me: () => request<UserResponse>("/api/v1/me"),
};
