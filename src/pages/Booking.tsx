import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  api,
  ApiError,
  errorMessages,
  type Appointment,
  type CounsellorDetail,
  type CounsellorSummary,
} from "../api";
import { useAuth } from "../auth/AuthContext";
import { formatDateChip, formatSessionWhen, formatSlot12h, groupSlots } from "../lib/booking";
import {
  bookingDraftKey,
  clampDraftStep,
  clearBookingDraft,
  loadBookingDraft,
  pickSlotFromDraft,
  saveBookingDraft,
  type BookingDraftGender,
  type BookingDraftStep,
} from "../lib/bookingDraft";
import { offeredSessions, previewItems } from "../lib/counsellor";
import { initials } from "../lib/text";
import "./Booking.css";

const TOPICS = [
  { id: "heartbreak", label: "Heartbreak & relationships" },
  { id: "anxiety", label: "Anxiety & stress" },
  { id: "career", label: "Career & life transitions" },
  { id: "self", label: "Self-growth" },
];

const TRUST = [
  { title: "Licensed experts", text: "Verified counsellors" },
  { title: "Private & safe", text: "Confidential sessions" },
  { title: "Flexible slots", text: "Book when it suits you" },
  { title: "Online first", text: "Join from anywhere" },
];

type Step = 1 | 2 | 3;

function topicFromSegment(segment: string | null): string {
  return TOPICS.some((t) => t.id === segment) ? segment! : TOPICS[0].id;
}

function draftMatches(
  draft: ReturnType<typeof loadBookingDraft>,
  routeSlug: string | undefined,
  rescheduleId: number | null,
  isHub: boolean,
): boolean {
  if (!draft) return false;
  if (draft.rescheduleId !== rescheduleId) return false;
  if (isHub) return draft.mode === "hub";
  return draft.mode === "slug" && draft.counsellorSlug === routeSlug;
}

function initialStep(routeSlug: string | undefined, rescheduleId: number | null, isHub: boolean): Step {
  const draft = loadBookingDraft(bookingDraftKey(routeSlug, rescheduleId));
  if (!draftMatches(draft, routeSlug, rescheduleId, isHub)) return 1;
  return clampDraftStep(draft!.step as BookingDraftStep, Boolean(draft!.selectedDate && draft!.selectedTime));
}

function initialField(
  routeSlug: string | undefined,
  rescheduleId: number | null,
  isHub: boolean,
  pick: (d: NonNullable<ReturnType<typeof loadBookingDraft>>) => string,
  fallback = "",
): string {
  const draft = loadBookingDraft(bookingDraftKey(routeSlug, rescheduleId));
  if (!draftMatches(draft, routeSlug, rescheduleId, isHub)) return fallback;
  return pick(draft!);
}

function initialGender(
  routeSlug: string | undefined,
  rescheduleId: number | null,
  isHub: boolean,
): "female" | "male" | "other" {
  const draft = loadBookingDraft(bookingDraftKey(routeSlug, rescheduleId));
  if (!draftMatches(draft, routeSlug, rescheduleId, isHub)) return "female";
  const g = draft!.gender;
  return g === "male" || g === "other" ? g : "female";
}

export default function Booking() {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const rescheduleId = Number(searchParams.get("reschedule") || "") || null;
  const isHub = !routeSlug;
  const activeSlug = routeSlug ?? searchParams.get("counsellor") ?? "";
  const { user } = useAuth();
  const draftKey = useMemo(() => bookingDraftKey(routeSlug, rescheduleId), [routeSlug, rescheduleId]);

  const [step, setStep] = useState<Step>(() => initialStep(routeSlug, rescheduleId, isHub));
  const [topic, setTopic] = useState(() => topicFromSegment(searchParams.get("segment")));
  const [roster, setRoster] = useState<CounsellorSummary[]>([]);
  const [counsellor, setCounsellor] = useState<CounsellorDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(Boolean(activeSlug));
  const [rosterLoading, setRosterLoading] = useState(isHub);
  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    initialField(routeSlug, rescheduleId, isHub, (d) => d.selectedDate ?? "", "") || null,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(() =>
    initialField(routeSlug, rescheduleId, isHub, (d) => d.selectedTime ?? "", "") || null,
  );
  const [note, setNote] = useState(() => initialField(routeSlug, rescheduleId, isHub, (d) => d.note));
  const [phone, setPhone] = useState(() => initialField(routeSlug, rescheduleId, isHub, (d) => d.phone));
  const [age, setAge] = useState(() => initialField(routeSlug, rescheduleId, isHub, (d) => d.age));
  const [gender, setGender] = useState<BookingDraftGender>(() => initialGender(routeSlug, rescheduleId, isHub));
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);
  const [counsellorSearch, setCounsellorSearch] = useState("");

  const setTopicAndUrl = useCallback(
    (id: string) => {
      setTopic(id);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("segment", id);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useLayoutEffect(() => {
    const draft = loadBookingDraft(draftKey);
    if (!draftMatches(draft, routeSlug, rescheduleId, isHub)) return;
    if (!isHub || !draft!.counsellorSlug) return;
    if (searchParams.get("counsellor") === draft!.counsellorSlug) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("counsellor", draft!.counsellorSlug);
        if (draft!.segment) next.set("segment", draft!.segment);
        return next;
      },
      { replace: true },
    );
  }, [draftKey, isHub, rescheduleId, routeSlug, searchParams, setSearchParams]);

  useEffect(() => {
    const segment = searchParams.get("segment");
    setTopic(topicFromSegment(segment));
  }, [searchParams]);

  useEffect(() => {
    if (!isHub) return;
    let cancelled = false;
    setRosterLoading(true);
    setRosterError(null);
    api.counsellors
      .list({ mode: "online" })
      .then(({ counsellors }) => {
        if (!cancelled) setRoster(counsellors);
      })
      .catch((err) => {
        if (!cancelled) setRosterError(errorMessages(err, "Could not load counsellors")[0] ?? "Could not load counsellors.");
      })
      .finally(() => {
        if (!cancelled) setRosterLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isHub]);

  useEffect(() => {
    if (!activeSlug) {
      setCounsellor(null);
      setDetailLoading(false);
      setDetailError(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    api.counsellors
      .get(activeSlug)
      .then(({ counsellor: c }) => {
        if (cancelled) return;
        setCounsellor(c);
        const draft = loadBookingDraft(draftKey);
        const useDraft = draftMatches(draft, routeSlug, rescheduleId, isHub) && draft!.counsellorSlug === c.slug;
        const { date, time } = useDraft
          ? pickSlotFromDraft(c.availability, draft!.selectedDate, draft!.selectedTime)
          : pickSlotFromDraft(c.availability, null, null);
        setSelectedDate(date);
        setSelectedTime(time);
        if (useDraft) {
          setStep(clampDraftStep(draft!.step, Boolean(date && time)));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCounsellor(null);
          setDetailError(errorMessages(err, "Could not load counsellor")[0] ?? "Could not load counsellor.");
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSlug, draftKey, isHub, rescheduleId, routeSlug]);

  useEffect(() => {
    if (confirmed) return;
    const slug = activeSlug || counsellor?.slug || "";
    const existing = loadBookingDraft(draftKey);
    if (!slug) {
      if (existing?.counsellorSlug && isHub) return;
      saveBookingDraft(draftKey, {
        mode: isHub ? "hub" : "slug",
        counsellorSlug: "",
        rescheduleId,
        segment: topic,
        step: 1,
        selectedDate: null,
        selectedTime: null,
        note,
        phone,
        age,
        gender,
      });
      return;
    }
    saveBookingDraft(draftKey, {
      mode: isHub ? "hub" : "slug",
      counsellorSlug: slug,
      rescheduleId,
      segment: topic,
      step,
      selectedDate,
      selectedTime,
      note,
      phone,
      age,
      gender,
    });
  }, [
    activeSlug,
    age,
    confirmed,
    counsellor?.slug,
    draftKey,
    gender,
    isHub,
    note,
    phone,
    rescheduleId,
    selectedDate,
    selectedTime,
    step,
    topic,
  ]);

  const day = useMemo(
    () => counsellor?.availability.find((d) => d.date === selectedDate) ?? null,
    [counsellor, selectedDate],
  );

  const slotGroups = useMemo(() => groupSlots(day?.slots ?? []), [day]);

  const filteredRoster = useMemo(() => {
    const q = counsellorSearch.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter((c) => {
      const haystack = [
        c.full_name,
        c.designation ?? "",
        ...c.languages,
        ...c.specializations,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [roster, counsellorSearch]);

  const firstName = counsellor?.full_name.split(/\s+/)[0] ?? "your counsellor";
  const duration = counsellor?.slot_minutes ?? 60;

  function pickCounsellor(slug: string) {
    if (isHub) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("counsellor", slug);
          next.set("segment", topic);
          return next;
        },
        { replace: true },
      );
    }
  }

  function clearCounsellor() {
    if (!isHub) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("counsellor");
        return next;
      },
      { replace: true },
    );
    setCounsellor(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setStep(1);
  }

  function pickDate(date: string) {
    setSelectedDate(date);
    const entry = counsellor?.availability.find((d) => d.date === date);
    setSelectedTime(entry?.slots[0] ?? null);
  }

  function canAdvance(): boolean {
    if (step === 1) return Boolean(activeSlug && selectedDate && selectedTime && counsellor);
    return true;
  }

  async function onConfirm(e: FormEvent) {
    e.preventDefault();
    if (!counsellor || !selectedDate || !selectedTime) return;
    setFormErrors([]);
    setSubmitting(true);
    try {
      const result = rescheduleId
        ? await api.appointments.reschedule(rescheduleId, { date: selectedDate, time: selectedTime })
        : await api.appointments.create({
            counsellor_slug: counsellor.slug,
            date: selectedDate,
            time: selectedTime,
            note: note.trim() || undefined,
          });
      setConfirmed(result.appointment);
      clearBookingDraft(draftKey);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormErrors(["That time is no longer available. Please pick another slot."]);
        setStep(1);
      } else {
        setFormErrors(errorMessages(err, "Could not complete booking"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const pageLoading = (isHub && rosterLoading && roster.length === 0) || (activeSlug && detailLoading && !counsellor);

  if (pageLoading) {
    return <p className="center-note">Loading booking…</p>;
  }

  if (activeSlug && detailError && !counsellor) {
    return (
      <section className="book-page">
        <div className="book-wrap">
          <p className="center-note">{detailError}</p>
          <p className="book-actions">
            {isHub ? (
              <Link className="btn btn-indigo" to="/booking">Back to booking</Link>
            ) : (
              <Link className="btn btn-indigo" to="/counsellors">Browse counsellors</Link>
            )}
          </p>
        </div>
      </section>
    );
  }

  if (confirmed && counsellor) {
    return (
      <section className="book-page">
        <div className="book-wrap book-success">
          <h2>{rescheduleId ? "Session rescheduled" : "You’re booked"}</h2>
          <p>{formatSessionWhen(confirmed.starts_at, confirmed.timezone)}</p>
          <p className="book-note">Payment is not required online yet. We’ll share meeting details on your dashboard.</p>
          <div className="book-actions">
            <Link className="btn btn-gold" to="/dashboard">Go to dashboard</Link>
            <Link className="btn btn-line" to={`/counsellors/${counsellor.slug}`}>View counsellor</Link>
          </div>
        </div>
      </section>
    );
  }

  const stepLabels = rescheduleId
    ? ["New time", "Your details", "Confirm"]
    : ["Schedule", "Details", "Payment"];

  return (
    <section className="book-page">
      <div className="book-banner" aria-hidden="true" />
      <div className="book-wrap">
        <header className="book-header">
          <div>
            <p className="book-header-eyebrow">Book a session</p>
            <h1>{rescheduleId ? "Reschedule your session" : isHub ? "Choose time & counsellor" : "Schedule with your counsellor"}</h1>
          </div>
        </header>

        <nav className="book-crumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          {isHub ? (
            <span>Book a session</span>
          ) : (
            <>
              <Link to="/counsellors">Counsellors</Link>
              <span aria-hidden="true">/</span>
              {counsellor ? (
                <>
                  <Link to={`/counsellors/${counsellor.slug}`}>{counsellor.full_name}</Link>
                  <span aria-hidden="true">/</span>
                </>
              ) : null}
              <span>Book</span>
            </>
          )}
        </nav>

        <div className="book-progress" aria-label="Booking progress">
          <div className="book-progress-track">
            <div
              className="book-progress-fill"
              style={{ width: `${((step - 1) / (stepLabels.length - 1)) * 100}%` }}
            />
          </div>
          <div className="book-steps">
            {stepLabels.map((label, index) => {
              const n = (index + 1) as Step;
              const active = step === n;
              const doneStep = step > n;
              return (
                <div
                  key={label}
                  className={`book-step${active ? " book-step--active" : ""}${doneStep ? " book-step--done" : ""}`}
                >
                  <span>{doneStep ? "✓" : n}</span>
                  <span className="book-step-label">{label}</span>
                </div>
              );
            })}
          </div>
          <p className="book-progress-hint">
            {step === 1 ? "1/3 Choose counsellor & time slot" : `Step ${step} of 3`}
          </p>
        </div>

        <div className="book-trust">
          {TRUST.map((item) => (
            <div key={item.title}>
              <b>{item.title}</b>
              {item.text}
            </div>
          ))}
        </div>

        <div className="book-topics" role="tablist" aria-label="Session focus">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-pressed={topic === t.id}
              onClick={() => setTopicAndUrl(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {rosterError && isHub && (
          <div className="form-error" role="alert" style={{ marginBottom: 16 }}>
            {rosterError}
          </div>
        )}

        {step === 1 && (
          <div className="book-grid">
            <div className="book-hero">
              <div className="book-hero-art">
                <span className="book-hero-badge">Manntattva</span>
                <p>
                  Healing is not linear, but every step is progress. <em>Start yours today.</em>
                </p>
                <ul className="book-hero-points">
                  <li>Private & confidential</li>
                  <li>Verified practitioners</li>
                  <li>Flexible scheduling</li>
                </ul>
              </div>
            </div>
            <div className="book-shell">
            <div className="book-side">
              {isHub && !counsellor && !detailLoading && (
                <div className="book-panel book-choose">
                  <div className="book-choose-head">
                    <h2>Choose your counsellor</h2>
                    <span className="book-choose-optional">Pick one to see times</span>
                  </div>
                  <div className="book-search-field">
                    <svg
                      className="book-search-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                    </svg>
                    <input
                      type="search"
                      className="book-search"
                      placeholder="Search by name, specialty, or language…"
                      value={counsellorSearch}
                      onChange={(e) => setCounsellorSearch(e.target.value)}
                      aria-label="Search counsellors"
                    />
                  </div>
                  <div className="book-choose-grid">
                    {filteredRoster.map((c) => {
                      const modes = offeredSessions(c);
                      const focus = previewItems(c.specializations, 3);
                      const langs = previewItems(c.languages, 2);
                      return (
                        <button
                          key={c.slug}
                          type="button"
                          className="book-pick-card"
                          onClick={() => pickCounsellor(c.slug)}
                        >
                          <div className="book-pick-top">
                            {c.photo_url ? (
                              <img src={c.photo_url} alt="" />
                            ) : (
                              <span className="book-avatar book-avatar--sm" aria-hidden="true">
                                {initials(c.full_name)}
                              </span>
                            )}
                            <div className="book-pick-title">
                              <b>{c.full_name}</b>
                              {modes.length > 0 && (
                                <span className="book-pick-modes">{modes.slice(0, 2).join(" · ")}</span>
                              )}
                            </div>
                          </div>
                          {c.designation && <small className="book-pick-role">{c.designation}</small>}
                          {langs.visible.length > 0 && (
                            <p className="book-pick-lang">
                              {langs.visible.join(", ")}
                              {langs.hidden > 0 ? ` +${langs.hidden}` : ""}
                            </p>
                          )}
                          {focus.visible.length > 0 && (
                            <div className="book-tags">
                              {focus.visible.map((s) => (
                                <span key={s}>{s}</span>
                              ))}
                              {focus.hidden > 0 && <span>+{focus.hidden}</span>}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {filteredRoster.length === 0 && (
                    <p className="book-choose-empty">No counsellors match your search.</p>
                  )}
                </div>
              )}

              {isHub && activeSlug && detailLoading && (
                <p className="book-loading">Loading availability…</p>
              )}

              {counsellor && (
                <>
                  <div className="book-selected">
                    <div className="book-selected-main">
                      {counsellor.photo_url ? (
                        <img src={counsellor.photo_url} alt="" />
                      ) : (
                        <span className="book-avatar" aria-hidden="true">{initials(counsellor.full_name)}</span>
                      )}
                      <div className="book-selected-info">
                        <b>{counsellor.full_name}</b>
                        {counsellor.designation && <small>{counsellor.designation}</small>}
                        {counsellor.specializations.length > 0 && (
                          <div className="book-tags">
                            {counsellor.specializations.slice(0, 3).map((s) => (
                              <span key={s}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {isHub && (
                      <div className="book-selected-actions">
                        <button type="button" className="book-link-btn" onClick={clearCounsellor}>
                          Change
                        </button>
                        <button type="button" className="book-link-btn book-link-btn--muted" onClick={clearCounsellor}>
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="book-schedule">
                    <div className="book-schedule-head">
                      <div>
                        <h2>
                          {rescheduleId ? "Pick a new time" : `Pick a time with ${firstName}`}
                        </h2>
                        <p>
                          All times are in {counsellor.timezone.replace(/_/g, " ")}. Tap a date, then select a slot.
                        </p>
                      </div>
                      <span className="book-duration">{duration} min</span>
                    </div>

                    <div className="book-dates" role="group" aria-label="Dates">
                      {counsellor.availability.map((d) => {
                        const chip = formatDateChip(d.date);
                        const disabled = d.slots.length === 0;
                        return (
                          <button
                            key={d.date}
                            type="button"
                            className="book-date"
                            disabled={disabled}
                            aria-pressed={selectedDate === d.date}
                            onClick={() => pickDate(d.date)}
                          >
                            <small>{chip.dow}</small>
                            <b>{chip.day}</b>
                            <span>{chip.mon}</span>
                          </button>
                        );
                      })}
                    </div>

                    {slotGroups.length === 0 ? (
                      <p className="book-note">No open slots on this day. Try another date.</p>
                    ) : (
                      slotGroups.map((group) => (
                        <div key={group.period} className="book-period">
                          <h3>{group.label}</h3>
                          <div className="book-slots" role="group" aria-label={group.label}>
                            {group.slots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                className="book-slot"
                                aria-pressed={selectedTime === slot}
                                onClick={() => setSelectedTime(slot)}
                              >
                                {formatSlot12h(slot)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="book-actions">
                    <button
                      type="button"
                      className="btn btn-gold"
                      disabled={!canAdvance()}
                      onClick={() => setStep(2)}
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
            </div>
            </div>
          </div>
        )}

        {step === 2 && counsellor && (
          <div className="book-panel book-panel--step">
            <h2>Tell us a little about you</h2>
            <p className="book-note" style={{ marginTop: 0, marginBottom: 16 }}>
              Signed in as <b>{user?.full_name}</b> ({user?.email}). Extra fields help your counsellor prepare; only your
              session note is sent to our server today.
            </p>
            <form className="book-form" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
              <div className="book-row book-row--contact">
                <label>
                  Mobile number
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" inputMode="tel" />
                </label>
                <label>
                  Age
                  <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" inputMode="numeric" />
                </label>
              </div>
              <label>
                Gender
                <div className="book-toggle" role="group" aria-label="Gender">
                  {(["female", "male", "other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={gender === g}
                      onClick={() => setGender(g)}
                    >
                      {g === "other" ? "Other" : g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </label>
              <label>
                What would you like to focus on? (saved as session note)
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Share what brought you here — optional but helpful."
                />
              </label>
              <div className="book-actions">
                <button type="button" className="btn btn-line" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="btn btn-gold">Continue to payment</button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && counsellor && (
          <form className="book-panel book-panel--step" onSubmit={onConfirm}>
            <h2>Review & confirm</h2>
            <div className="book-chips" role="group" aria-label="Session length">
              <button type="button" aria-pressed={true}>
                {duration} minute session
                <small>Online · with {counsellor.full_name}</small>
              </button>
            </div>

            <div className="book-summary">
              <div>
                <small>SELECTED SLOT</small>
                <b>
                  {selectedDate && selectedTime
                    ? `${formatDateChip(selectedDate).dow} ${formatDateChip(selectedDate).day} ${formatDateChip(selectedDate).mon} · ${formatSlot12h(selectedTime)}`
                    : "—"}
                </b>
              </div>
              <div>
                <small>TOTAL DUE</small>
                <b>₹0</b>
              </div>
            </div>

            <p className="book-note">
              Online payment is coming soon. Confirming reserves your slot; you can cancel or reschedule from your dashboard
              while the session is still upcoming.
            </p>

            {formErrors.length > 0 && (
              <div className="form-error" role="alert">
                {formErrors.map((msg) => <div key={msg}>{msg}</div>)}
              </div>
            )}

            <div className="book-actions">
              <button type="button" className="btn btn-line" onClick={() => setStep(2)} disabled={submitting}>
                Back
              </button>
              <button type="submit" className="btn btn-gold" disabled={submitting}>
                {submitting ? "Confirming…" : rescheduleId ? "Confirm new time" : "Confirm booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
