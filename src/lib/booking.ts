export type SlotPeriod = "morning" | "afternoon" | "evening";

const PERIODS: { id: SlotPeriod; label: string; min: number; max: number }[] = [
  { id: "morning", label: "Morning (6 AM – 12 PM)", min: 6 * 60, max: 12 * 60 },
  { id: "afternoon", label: "Afternoon (12 PM – 5 PM)", min: 12 * 60, max: 17 * 60 },
  { id: "evening", label: "Evening (5 PM – 10 PM)", min: 17 * 60, max: 22 * 60 },
];

function slotMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function formatSlot12h(value: string): string {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const clock = hour % 12 || 12;
  return `${clock}:${minuteText} ${suffix}`;
}

export function formatDateChip(isoDate: string): { dow: string; day: string; mon: string } {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return {
    dow: new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" }).format(date).toUpperCase(),
    day: String(d),
    mon: new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" }).format(date),
  };
}

export function formatSessionWhen(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZone || "Asia/Kolkata",
  }).format(new Date(iso));
}

export function groupSlots(slots: string[]): { period: SlotPeriod; label: string; slots: string[] }[] {
  return PERIODS.map((p) => ({
    period: p.id,
    label: p.label,
    slots: slots.filter((s) => {
      const mins = slotMinutes(s);
      return mins >= p.min && mins < p.max;
    }),
  })).filter((g) => g.slots.length > 0);
}

export function appointmentChangeable(status: string, startsAt: string): boolean {
  return status === "confirmed" && new Date(startsAt).getTime() > Date.now();
}
