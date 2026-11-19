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
  banner_url: string | null;
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
  slot_minutes: number;
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

export interface AdminUserRow {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface AdminAnalytics {
  generated_at: string;
  users: { total: number; clients: number; counsellors: number; admins: number };
  counsellors: { total: number; published: number; draft: number; verified: number };
  appointments: {
    total: number;
    upcoming: number;
    this_month: number;
    last_7_days: number;
    by_status: Record<string, number>;
    last_7_days_series: Array<{ date: string; label: string; count: number }>;
  };
  top_counsellors: Array<{
    counsellor_id: number;
    full_name: string;
    slug: string;
    bookings: number;
  }>;
}

export interface AdminCounsellorUpdate {
  status?: "draft" | "published";
  is_verified?: boolean;
  registration_no?: string;
}

export type ContentStatus = "draft" | "pending" | "published" | "rejected";
export type EventKind = "workshop" | "webinar" | "retreat" | "festival";
export type EventMode = "online" | "offline" | "hybrid";

export interface ContentAuthor {
  slug: string;
  full_name: string;
  is_verified: boolean;
  photo_url?: string | null;
}

export interface PublicBlog {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image_url: string | null;
  published_at: string | null;
  author: ContentAuthor;
}

export interface PublicEvent {
  id: number;
  slug: string;
  title: string;
  body: string;
  kind: EventKind;
  mode: EventMode;
  location: string | null;
  meeting_url: string | null;
  starts_at: string;
  ends_at: string;
  published_at: string | null;
  author: ContentAuthor;
}

export interface OwnerBlog extends Omit<PublicBlog, "excerpt"> {
  excerpt: string | null;
  status: ContentStatus;
  reviewer_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerEvent extends PublicEvent {
  status: ContentStatus;
  reviewer_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogInput {
  title: string;
  excerpt: string;
  body: string;
  cover_image?: File;
}

export interface EventInput {
  title: string;
  body: string;
  kind: EventKind;
  mode: EventMode;
  location: string;
  meeting_url: string;
  starts_at: string;
  ends_at: string;
}

export interface VerifyResult {
  found: boolean;
  verified?: boolean;
  counsellor?: CounsellorSummary & { registration_no: string };
}

export interface CounsellorFilters {
  language?: string;
  specialization?: string;
  mode?: "" | "online" | "offline";
  limit?: number;
}

export interface AppointmentCounsellor {
  slug: string;
  full_name: string;
  designation: string | null;
}

export interface AppointmentStudent {
  full_name: string;
  email: string;
}

export interface Appointment {
  id: number;
  status: string;
  mode: string;
  note: string | null;
  payment_status: string;
  reschedule_count: number;
  starts_at: string;
  ends_at: string;
  timezone: string;
  meeting_link: string | null;
  counsellor: AppointmentCounsellor;
  student?: AppointmentStudent;
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

function blogForm(values: BlogInput): FormData {
  const form = new FormData();
  form.append("blog[title]", values.title);
  form.append("blog[excerpt]", values.excerpt);
  form.append("blog[body]", values.body);
  if (values.cover_image) form.append("blog[cover_image]", values.cover_image);
  return form;
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
  uploadBanner: (file: File) => {
    const form = new FormData();
    form.append("banner", file);
    return request<UserResponse>("/api/v1/me/banner", { method: "PATCH", form });
  },
  removeBanner: () => request<UserResponse>("/api/v1/me/banner", { method: "DELETE" }),

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
    verify: (registration_no: string) =>
      request<VerifyResult>(`/api/v1/verify?registration_no=${encodeURIComponent(registration_no)}`),
  },
  blogs: {
    list: () => request<{ blogs: PublicBlog[] }>("/api/v1/blogs"),
    get: (slug: string) => request<{ blog: PublicBlog }>(`/api/v1/blogs/${encodeURIComponent(slug)}`),
  },
  events: {
    list: (scope?: "upcoming" | "past") =>
      request<{ events: PublicEvent[] }>(`/api/v1/events${scope === "past" ? "?scope=past" : ""}`),
    get: (slug: string) => request<{ event: PublicEvent }>(`/api/v1/events/${encodeURIComponent(slug)}`),
  },
  lookups: {
    languages: () => request<{ languages: Option[] }>("/api/v1/languages"),
    specializations: () => request<{ specializations: Option[] }>("/api/v1/specializations"),
  },

  appointments: {
    list: () => request<{ appointments: Appointment[] }>("/api/v1/appointments"),
    create: (values: { counsellor_slug: string; date: string; time: string; note?: string }) =>
      request<{ appointment: Appointment }>("/api/v1/appointments", {
        method: "POST",
        body: values,
      }),
    reschedule: (id: number, values: { date: string; time: string }) =>
      request<{ appointment: Appointment }>(`/api/v1/appointments/${id}/reschedule`, {
        method: "PATCH",
        body: values,
      }),
    cancel: (id: number) =>
      request<{ appointment: Appointment }>(`/api/v1/appointments/${id}/cancel`, { method: "PATCH" }),
  },

  // ----- Counsellor (own schedule) -----
  myAppointments: {
    setStatus: (id: number, status: "completed" | "no_show" | "cancelled") =>
      request<{ appointment: Appointment }>(`/api/v1/my/appointments/${id}`, {
        method: "PATCH",
        body: { appointment: { status } },
      }),
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
  myBlogs: {
    list: () => request<{ blogs: OwnerBlog[] }>("/api/v1/my/blogs"),
    get: (id: number) => request<{ blog: OwnerBlog }>(`/api/v1/my/blogs/${id}`),
    create: (values: BlogInput) =>
      request<{ blog: OwnerBlog }>("/api/v1/my/blogs", { method: "POST", form: blogForm(values) }),
    update: (id: number, values: BlogInput) =>
      request<{ blog: OwnerBlog }>(`/api/v1/my/blogs/${id}`, { method: "PATCH", form: blogForm(values) }),
    destroy: (id: number) => request<null>(`/api/v1/my/blogs/${id}`, { method: "DELETE" }),
    submit: (id: number) =>
      request<{ blog: OwnerBlog }>(`/api/v1/my/blogs/${id}/submit`, { method: "PATCH" }),
  },
  myEvents: {
    list: () => request<{ events: OwnerEvent[] }>("/api/v1/my/events"),
    get: (id: number) => request<{ event: OwnerEvent }>(`/api/v1/my/events/${id}`),
    create: (values: EventInput) =>
      request<{ event: OwnerEvent }>("/api/v1/my/events", { method: "POST", body: { event: values } }),
    update: (id: number, values: EventInput) =>
      request<{ event: OwnerEvent }>(`/api/v1/my/events/${id}`, { method: "PATCH", body: { event: values } }),
    destroy: (id: number) => request<null>(`/api/v1/my/events/${id}`, { method: "DELETE" }),
    submit: (id: number) =>
      request<{ event: OwnerEvent }>(`/api/v1/my/events/${id}/submit`, { method: "PATCH" }),
  },

  // ----- Admin -----
  admin: {
    analytics: () => request<{ analytics: AdminAnalytics }>("/api/v1/admin/analytics"),
    users: {
      list: () => request<{ users: AdminUserRow[] }>("/api/v1/admin/users"),
    },
    appointments: {
      setPayment: (id: number, payment_status: "unpaid" | "paid" | "waived") =>
        request<{ appointment: Appointment }>(`/api/v1/admin/appointments/${id}`, {
          method: "PATCH",
          body: { appointment: { payment_status } },
        }),
    },
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
    blogs: {
      list: (status?: ContentStatus | "") =>
        request<{ items: OwnerBlog[] }>(`/api/v1/admin/blogs${status ? `?status=${status}` : ""}`),
      approve: (id: number) =>
        request<{ item: OwnerBlog }>(`/api/v1/admin/blogs/${id}/approve`, { method: "PATCH" }),
      reject: (id: number, reviewer_note: string) =>
        request<{ item: OwnerBlog }>(`/api/v1/admin/blogs/${id}/reject`, {
          method: "PATCH",
          body: { reviewer_note },
        }),
    },
    events: {
      list: (status?: ContentStatus | "") =>
        request<{ items: OwnerEvent[] }>(`/api/v1/admin/events${status ? `?status=${status}` : ""}`),
      approve: (id: number) =>
        request<{ item: OwnerEvent }>(`/api/v1/admin/events/${id}/approve`, { method: "PATCH" }),
      reject: (id: number, reviewer_note: string) =>
        request<{ item: OwnerEvent }>(`/api/v1/admin/events/${id}/reject`, {
          method: "PATCH",
          body: { reviewer_note },
        }),
    },
  },
};
