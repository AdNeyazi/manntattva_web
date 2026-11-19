import type { ContentStatus, EventKind, EventMode } from "../api";

export const EVENT_KINDS: { id: EventKind; label: string }[] = [
  { id: "workshop", label: "Workshop" },
  { id: "webinar", label: "Webinar" },
  { id: "retreat", label: "Retreat" },
  { id: "festival", label: "Festival" },
];

export const EVENT_MODES: { id: EventMode; label: string }[] = [
  { id: "online", label: "Online" },
  { id: "offline", label: "In person" },
  { id: "hybrid", label: "Hybrid" },
];

export function statusLabel(status: ContentStatus): string {
  if (status === "pending") return "Awaiting approval";
  if (status === "published") return "Live";
  if (status === "rejected") return "Needs revision";
  return "Draft";
}

export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string): string {
  return new Date(value).toISOString();
}
