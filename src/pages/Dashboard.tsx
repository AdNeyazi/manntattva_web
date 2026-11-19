import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages, type Appointment, type Role } from "../api";
import { useAuth } from "../auth/AuthContext";
import { appointmentChangeable, formatSessionWhen } from "../lib/booking";
import "./Dashboard.css";

function emptyCopy(role: Role): { title: string; body: ReactNode } {
  if (role === "admin") {
    return { title: "Upcoming sessions", body: "No upcoming appointments in the system." };
  }
  if (role === "counsellor") {
    return {
      title: "Upcoming client sessions",
      body: "When clients book with you, their sessions will show up here.",
    };
  }
  return {
    title: "Upcoming sessions",
    body: (
      <>
        No upcoming bookings. <Link to="/counsellors">Find a counsellor</Link> to schedule one.
      </>
    ),
  };
}

function sessionTitle(a: Appointment, role: Role): string {
  if (role === "end_user") return a.counsellor.full_name;
  if (role === "counsellor") return a.student?.full_name ?? "Client";
  return `${a.student?.full_name ?? "Client"} with ${a.counsellor.full_name}`;
}

function sessionMeta(a: Appointment, role: Role): string | null {
  if (role === "end_user" && a.counsellor.designation) return a.counsellor.designation;
  if (role === "counsellor" && a.student?.email) return a.student.email;
  if (role === "admin") {
    const parts = [a.student?.email, a.counsellor.designation].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : null;
  }
  return null;
}

function sessionDateChip(startsAt: string, timeZone: string): { dow: string; day: string } {
  const d = new Date(startsAt);
  return {
    dow: new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone }).format(d),
    day: new Intl.DateTimeFormat("en-IN", { day: "numeric", timeZone }).format(d),
  };
}

function isSameCalendarDay(iso: string, timeZone: string): boolean {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(new Date(iso)) === fmt.format(new Date());
}

type SessionStatus = "completed" | "no_show" | "cancelled";

function SessionCard({
  appointment: a,
  role,
  past,
  canManageBookings,
  busyId,
  onCancel,
  onSetStatus,
}: {
  appointment: Appointment;
  role: Role;
  past?: boolean;
  canManageBookings: boolean;
  busyId: number | null;
  onCancel: (id: number) => void;
  onSetStatus: (id: number, status: SessionStatus) => void;
}) {
  const meta = sessionMeta(a, role);
  const chip = sessionDateChip(a.starts_at, a.timezone);
  const showJoin = !past && a.meeting_link && (role === "counsellor" || role === "end_user");
  const showNote = a.note && role === "counsellor";
  const counsellorUpcoming = role === "counsellor" && appointmentChangeable(a.status, a.starts_at);
  const counsellorNeedsOutcome = role === "counsellor" && a.status === "confirmed" && !counsellorUpcoming;

  return (
    <li className={`dash-session${past ? " dash-session--past" : ""}`}>
      <div className="dash-session-date" aria-hidden="true">
        <small>{chip.dow}</small>
        <b>{chip.day}</b>
      </div>
      <div className="dash-session-body">
        <h3>{sessionTitle(a, role)}</h3>
        {meta && <p className="dash-session-meta">{meta}</p>}
        <p className="dash-session-when">{formatSessionWhen(a.starts_at, a.timezone)}</p>
        <div className="dash-session-tags">
          <span className="dash-tag">{a.status.replace("_", " ")}</span>
          {a.mode && <span className="dash-tag dash-tag--mode">{a.mode.replace("_", " ")}</span>}
          {role === "admin" && (
            <Link className="dash-tag" to={`/counsellors/${a.counsellor.slug}`}>
              Counsellor profile
            </Link>
          )}
        </div>
        {showNote && (
          <p className="dash-session-note">
            <b>Client note:</b> {a.note}
          </p>
        )}
      </div>
      <div className="dash-session-actions">
        {showJoin && (
          <a className="btn btn-sm btn-gold" href={a.meeting_link!} target="_blank" rel="noopener noreferrer">
            Join meeting
          </a>
        )}
        {!past && canManageBookings && appointmentChangeable(a.status, a.starts_at) && (
          <>
            <Link
              className="btn btn-sm btn-line"
              to={`/counsellors/${a.counsellor.slug}/book?reschedule=${a.id}`}
            >
              Reschedule
            </Link>
            <button
              type="button"
              className="btn btn-sm btn-line"
              disabled={busyId === a.id}
              onClick={() => onCancel(a.id)}
            >
              {busyId === a.id ? "Cancelling…" : "Cancel"}
            </button>
          </>
        )}
        {counsellorUpcoming && (
          <button type="button" className="btn btn-sm btn-line" disabled={busyId === a.id}
            onClick={() => onSetStatus(a.id, "cancelled")}>
            {busyId === a.id ? "Cancelling…" : "Cancel session"}
          </button>
        )}
        {counsellorNeedsOutcome && (
          <>
            <button type="button" className="btn btn-sm btn-gold" disabled={busyId === a.id}
              onClick={() => onSetStatus(a.id, "completed")}>
              Mark completed
            </button>
            <button type="button" className="btn btn-sm btn-line" disabled={busyId === a.id}
              onClick={() => onSetStatus(a.id, "no_show")}>
              No-show
            </button>
          </>
        )}
        {role === "end_user" && !past && (
          <Link className="btn btn-sm btn-line" to={`/counsellors/${a.counsellor.slug}`}>
            View counsellor
          </Link>
        )}
      </div>
    </li>
  );
}

export default function Dashboard() {
  const { user, replaceUser } = useAuth();
  const [bannerBusy, setBannerBusy] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    api.appointments
      .list()
      .then(({ appointments: list }) => {
        if (cancelled) return;
        setAppointments(list);
        setErrors([]);
      })
      .catch((err) => {
        if (!cancelled) setErrors(errorMessages(err, "Could not load appointments"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function cancel(id: number) {
    if (!window.confirm("Cancel this session? Fees are not refunded when a session is cancelled.")) return;
    setBusyId(id);
    setErrors([]);
    try {
      await api.appointments.cancel(id);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setErrors(errorMessages(err, "Could not cancel session"));
    } finally {
      setBusyId(null);
    }
  }

  const upcoming = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === "confirmed" && new Date(a.starts_at).getTime() > now,
      ),
    [appointments, now],
  );

  const past = useMemo(
    () => appointments.filter((a) => !upcoming.includes(a)),
    [appointments, upcoming],
  );

  const todayCount = useMemo(
    () => upcoming.filter((a) => isSameCalendarDay(a.starts_at, a.timezone)).length,
    [upcoming],
  );

  async function onBanner(file: File | undefined) {
    if (!file) return;
    setBannerError(null);
    setBannerBusy(true);
    try {
      const d = await api.uploadBanner(file);
      replaceUser(d.user);
    } catch (err) {
      setBannerError(errorMessages(err, "Could not upload that cover")[0]);
    } finally {
      setBannerBusy(false);
    }
  }

  async function removeBanner() {
    setBannerError(null);
    setBannerBusy(true);
    try {
      const d = await api.removeBanner();
      replaceUser(d.user);
    } catch (err) {
      setBannerError(errorMessages(err, "Could not remove the cover")[0]);
    } finally {
      setBannerBusy(false);
    }
  }

  async function setStatus(id: number, status: SessionStatus) {
    if (status === "cancelled" && !window.confirm("Cancel this session? The client will lose their booking.")) return;
    setBusyId(id);
    setErrors([]);
    try {
      await api.myAppointments.setStatus(id, status);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setErrors(errorMessages(err, "Could not update the session"));
    } finally {
      setBusyId(null);
    }
  }

  if (!user) return null;

  const role = user.role;
  const copy = emptyCopy(role);
  const canManageBookings = role === "end_user";
  const firstName = user.full_name.split(/\s+/)[0] || user.full_name;

  return (
    <div className="dash-page">
      <header
        className={`dash-hero${user.banner_url ? " dash-hero--cover" : ""}`}
        style={user.banner_url ? { backgroundImage: `url("${user.banner_url}")` } : undefined}
      >
        <div className="dash-banner-tools">
          <label className="dash-banner-edit">
            {bannerBusy ? "Saving…" : user.banner_url ? "Edit cover" : "Add cover photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={bannerBusy}
              onChange={(e) => {
                void onBanner(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {user.banner_url && (
            <button type="button" className="dash-banner-remove" disabled={bannerBusy} onClick={() => void removeBanner()}>
              Remove
            </button>
          )}
        </div>
        {bannerError && <p className="dash-banner-error" role="alert">{bannerError}</p>}
        <div className="container dash-hero-inner">
          <h1>{role === "counsellor" ? "My account" : <>Hello, <em>{firstName}</em></>}</h1>
          <p className="dash-hero-sub">
            {role === "counsellor" ? (
              <>
                Hello, <b>{firstName}</b> · signed in as <b>{user.email}</b>
              </>
            ) : (
              <>
                Signed in as <b>{user.email}</b>
              </>
            )}
          </p>
          <div className="dash-hero-actions">
            {role === "admin" && (
              <Link className="btn btn-sm btn-gold" to="/admin">
                Admin console
              </Link>
            )}
            {role === "counsellor" && (
              <>
                <Link className="btn btn-sm btn-gold" to="/my">
                  Dashboard
                </Link>
                <Link className="btn btn-sm btn-ghost" to="/my/profile">
                  Edit my profile
                </Link>
              </>
            )}
            {role === "end_user" && (
              <Link className="btn btn-sm btn-gold" to="/booking?segment=heartbreak">
                Book a session
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container dash-body">
        <div className="dash-stats">
          <div className="dash-stat">
            <b>{loading ? "—" : upcoming.length}</b>
            <span>Upcoming</span>
          </div>
          <div className="dash-stat">
            <b>{loading ? "—" : todayCount}</b>
            <span>Today</span>
          </div>
          <div className="dash-stat">
            <b>{loading ? "—" : past.length}</b>
            <span>Past & other</span>
          </div>
        </div>

        {(role === "admin" || role === "counsellor") && (
          <div className="dash-quick">
            {role === "admin" && (
              <Link className="dash-quick-card" to="/admin">
                <h3>Admin console</h3>
                <p>Counsellors, appointments, users, analytics, and platform settings in one place.</p>
                <span className="card-link">Open console →</span>
              </Link>
            )}
            {role === "counsellor" && (
              <Link className="dash-quick-card" to="/my/profile">
                <h3>Your public profile</h3>
                <p>Update bio, availability, and how clients see you on the counsellor directory.</p>
                <span className="card-link">Edit profile →</span>
              </Link>
            )}
            <div className="dash-quick-card">
              <h3>{role === "admin" ? "System overview" : "Your schedule"}</h3>
              <p>
                {role === "admin"
                  ? "Upcoming sessions across all counsellors and clients appear below."
                  : "Client session notes and meeting links appear on each upcoming booking."}
              </p>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="form-error" role="alert" style={{ marginBottom: 20 }}>
            {errors.map((m) => (
              <div key={m}>{m}</div>
            ))}
          </div>
        )}

        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2>{copy.title}</h2>
            {!loading && upcoming.length > 0 && (
              <span>
                {upcoming.length} {upcoming.length === 1 ? "session" : "sessions"}
              </span>
            )}
          </div>
          {loading ? (
            <p className="dash-loading">Loading appointments…</p>
          ) : upcoming.length === 0 ? (
            <div className="dash-empty">{copy.body}</div>
          ) : (
            <ul className="dash-sessions">
              {upcoming.map((a) => (
                <SessionCard
                  key={a.id}
                  appointment={a}
                  role={role}
                  canManageBookings={canManageBookings}
                  busyId={busyId}
                  onCancel={(id) => void cancel(id)}
                  onSetStatus={(id, status) => void setStatus(id, status)}
                />
              ))}
            </ul>
          )}
        </section>

        {!loading && past.length > 0 && (
          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Past sessions</h2>
              <span>{past.length} total</span>
            </div>
            <ul className="dash-sessions">
              {past.map((a) => (
                <SessionCard
                  key={a.id}
                  appointment={a}
                  role={role}
                  past
                  canManageBookings={false}
                  busyId={busyId}
                  onCancel={() => undefined}
                  onSetStatus={(id, status) => void setStatus(id, status)}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
