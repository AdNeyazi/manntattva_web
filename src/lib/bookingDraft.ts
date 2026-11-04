const STORAGE_PREFIX = "manntattva_booking_draft";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type BookingDraftStep = 1 | 2 | 3;

export interface BookingDraft {
  v: 1;
  mode: "hub" | "slug";
  counsellorSlug: string;
  rescheduleId: number | null;
  segment: string;
  step: BookingDraftStep;
  selectedDate: string | null;
  selectedTime: string | null;
  note: string;
  updatedAt: number;
}

export function bookingDraftKey(routeSlug: string | undefined, rescheduleId: number | null): string {
  const path = routeSlug ?? "hub";
  const reschedule = rescheduleId ?? 0;
  return `${STORAGE_PREFIX}:${path}:${reschedule}`;
}

function isStep(value: number): value is BookingDraftStep {
  return value === 1 || value === 2 || value === 3;
}

export function loadBookingDraft(key: string): BookingDraft | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as BookingDraft;
    if (data.v !== 1) return null;
    if (!data.counsellorSlug || !isStep(data.step) || Date.now() - data.updatedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function saveBookingDraft(key: string, draft: Omit<BookingDraft, "v" | "updatedAt">): void {
  try {
    const payload: BookingDraft = { v: 1, ...draft, updatedAt: Date.now() };
    sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // sessionStorage full or disabled — ignore
  }
}

export function clearBookingDraft(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function clampDraftStep(step: BookingDraftStep, hasSlot: boolean): BookingDraftStep {
  if (!hasSlot) return 1;
  if (step <= 1) return 1;
  if (step === 2) return 2;
  return 3;
}

export function pickSlotFromDraft(
  availability: { date: string; slots: string[] }[],
  date: string | null,
  time: string | null,
): { date: string | null; time: string | null } {
  if (!date) {
    const first = availability.find((d) => d.slots.length > 0);
    return { date: first?.date ?? null, time: first?.slots[0] ?? null };
  }
  const day = availability.find((d) => d.date === date);
  if (!day || day.slots.length === 0) {
    const first = availability.find((d) => d.slots.length > 0);
    return { date: first?.date ?? null, time: first?.slots[0] ?? null };
  }
  if (time && day.slots.includes(time)) return { date, time };
  return { date, time: day.slots[0] ?? null };
}
