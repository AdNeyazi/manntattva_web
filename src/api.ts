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

export interface Option {
  id: number;
  name: string;
}

export interface Certification {
  title: string;
  issuer: string | null;
  year: number | null;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
}

// What the public list shows.
export interface EducationRecord {
  title: string;
  institution: string | null;
  start_year: number | null;
  end_year: number | null;
}

export interface ExperienceRecord {
  title: string;
  organisation: string | null;
  location: string | null;
  start_year: number | null;
  end_year: number | null;
}

export interface AvailabilityDay {
  date: string;
  slots: string[];
}

export interface AvailabilityRule {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface CounsellorSummary {
  id: number;
  slug: string;
  full_name: string;
  designation: string | null;
  education: string | null;
  experience_years: number | null;
  is_verified: boolean;
  offers_online: boolean;
  offers_offline: boolean;
  offers_audio: boolean;
  offers_video: boolean;
  photo_url: string | null;
  languages: string[];
  specializations: string[];
}

// What the public profile page shows.
export interface CounsellorDetail extends CounsellorSummary {
  bio: string | null;
  methodology: string | null;
  registration_no: string | null;
  social_links: SocialLinks;
  certifications: Certification[];
  educations: EducationRecord[];
  experiences: ExperienceRecord[];
  timezone: string;
  next_available_at: string | null;
  availability: AvailabilityDay[];
}

// What the counsellor (their own profile) and admins see.
export interface CounsellorAdmin extends CounsellorDetail {
  email: string;
  status: "draft" | "published";
  language_ids: number[];
  specialization_ids: number[];
  slot_minutes: number;
  availability_rules: AvailabilityRule[];
}

// Fields a counsellor may change on their own profile.
export interface ProfileUpdate {
  designation: string;
  education: string;
  bio: string;
  methodology: string;
  experience_years: number | "";
  offers_online: boolean;
  offers_offline: boolean;
  offers_audio: boolean;
  offers_video: boolean;
  social_links: SocialLinks;
  language_ids: number[];
  specialization_ids: number[];
  certifications: { title: string; issuer: string; year: number | "" }[];
  educations: { title: string; institution: string; start_year: number | ""; end_year: number | "" }[];
  experiences: { title: string; organisation: string; location: string; start_year: number | ""; end_year: number | "" }[];
  timezone: string;
  slot_minutes: number;
  availability_rules: AvailabilityRule[];
}

export interface NewCounsellor {
  full_name: string;
  email: string;
  password: string;
  designation: string;
}

export interface AdminCounsellorUpdate {
  status?: "draft" | "published";
  is_verified?: boolean;
  registration_no?: string;
}

export interface CounsellorFilters {
  language?: string;
  specialization?: string;
  mode?: "" | "online" | "offline";
  limit?: number;
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
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  form?: FormData;
}

async function request<T>(path: string, { method = "GET", body, form }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (!form) headers["Content-Type"] = "application/json";
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
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

  // ----- Public -----
  counsellors: {
    list: (filters: CounsellorFilters = {}) => {
      const q = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== "") q.set(key, String(value));
      }
      const qs = q.toString();
      return request<{ counsellors: CounsellorSummary[] }>(`/api/v1/counsellors${qs ? `?${qs}` : ""}`);
    },
    get: (slug: string) =>
      request<{ counsellor: CounsellorDetail }>(`/api/v1/counsellors/${encodeURIComponent(slug)}`),
  },
  lookups: {
    languages: () => request<{ languages: Option[] }>("/api/v1/languages"),
    specializations: () => request<{ specializations: Option[] }>("/api/v1/specializations"),
  },

  // ----- Counsellor (own profile) -----
  myProfile: {
    get: () => request<{ counsellor: CounsellorAdmin }>("/api/v1/my/counsellor_profile"),
    update: (values: ProfileUpdate) =>
      request<{ counsellor: CounsellorAdmin }>("/api/v1/my/counsellor_profile", {
        method: "PATCH",
        body: { counsellor: values },
      }),
    uploadPhoto: (file: File) => {
      const form = new FormData();
      form.append("photo", file);
      return request<{ counsellor: CounsellorAdmin }>("/api/v1/my/counsellor_profile/photo", {
        method: "PATCH",
        form,
      });
    },
    removePhoto: () =>
      request<{ counsellor: CounsellorAdmin }>("/api/v1/my/counsellor_profile/photo", { method: "DELETE" }),
  },

  // ----- Admin -----
  admin: {
    counsellors: {
      list: () => request<{ counsellors: CounsellorAdmin[] }>("/api/v1/admin/counsellors"),
      create: (values: NewCounsellor) =>
        request<{ counsellor: CounsellorAdmin }>("/api/v1/admin/counsellors", {
          method: "POST",
          body: { counsellor: values },
        }),
      update: (id: number, values: AdminCounsellorUpdate) =>
        request<{ counsellor: CounsellorAdmin }>(`/api/v1/admin/counsellors/${id}`, {
          method: "PATCH",
          body: { counsellor: values },
        }),
    },
  },
};
