import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages, type Appointment, type Role } from "../api";
import { useAuth } from "../auth/AuthContext";
import { appointmentChangeable, formatSessionWhen } from "../lib/booking";

function emptyCopy(role: Role): { title: string; body: ReactNode } {
  if (role === "admin") {
    return { title: "Upcoming sessions", body: "No upcoming appointments in the system." };
  }
  if (role === "counsellor") {
    return { title: "Upcoming client sessions", body: "No upcoming client bookings yet." };
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
  if (role !== "end_user" && a.student?.email) return a.student.email;
  if (role === "admin" && a.counsellor.designation) return a.counsellor.designation;
  return null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrors([]);
    try {
      const { appointments: list } = await api.appointments.list();
      setAppointments(list);
    } catch (err) {
      setErrors(errorMessages(err, "Could not load appointments"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function cancel(id: number) {
    setBusyId(id);
    setErrors([]);
    try {
      await api.appointments.cancel(id);
      await load();
    } catch (err) {
      setErrors(errorMessages(err, "Could not cancel session"));
    } finally {
      setBusyId(null);
    }
  }

  if (!user) return null;

  const role = user.role;
  const copy = emptyCopy(role);
  const canManageBookings = role === "end_user";

  const upcoming = appointments.filter(
    (a) => a.status === "confirmed" && new Date(a.starts_at).getTime() > Date.now(),
  );
  const past = appointments.filter((a) => !upcoming.includes(a));

  return (
    <section className="dashboard container">
      <div className="card dash-card">
        <span className="pill">{user.role.replace("_", " ")}</span>
        <h1>Hello, {user.full_name}</h1>
        <p className="dash-sub">Signed in as <b>{user.email}</b></p>
      </div>

      {errors.length > 0 && (
        <div className="form-error" role="alert" style={{ marginTop: 16 }}>
          {errors.map((m) => <div key={m}>{m}</div>)}
        </div>
      )}

      <div className="card dash-card" style={{ marginTop: 20 }}>
        <h2 style={{ marginBottom: 12 }}>{copy.title}</h2>
        {loading ? (
          <p>Loading appointments…</p>
        ) : upcoming.length === 0 ? (
          <p>{copy.body}</p>
        ) : (
          <ul className="dash-appointments">
            {upcoming.map((a) => {
              const meta = sessionMeta(a, role);
              return (
                <li key={a.id} className="dash-appt">
                  <div>
                    <b>{sessionTitle(a, role)}</b>
                    {meta && <span className="dash-appt-meta"> · {meta}</span>}
                    <p className="dash-appt-when">{formatSessionWhen(a.starts_at, a.timezone)}</p>
                    {a.note && role !== "end_user" && (
                      <p className="dash-appt-note">Note: {a.note}</p>
                    )}
                    {a.meeting_link && (role === "counsellor" || role === "end_user") && (
                      <p>
                        <a href={a.meeting_link} target="_blank" rel="noopener noreferrer">Join meeting</a>
                      </p>
                    )}
                  </div>
                  <div className="dash-appt-actions">
                    {canManageBookings && appointmentChangeable(a.status, a.starts_at) && (
                      <>
                        <Link
                          className="btn btn-sm btn-line"
                          to={`/counsellors/${a.counsellor.slug}/book?reschedule=${a.id}`}
                        >
                          Reschedule
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          disabled={busyId === a.id}
                          onClick={() => void cancel(a.id)}
                        >
                          {busyId === a.id ? "Cancelling…" : "Cancel"}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!loading && past.length > 0 && (
        <div className="card dash-card" style={{ marginTop: 20 }}>
          <h2 style={{ marginBottom: 12 }}>Past sessions</h2>
          <ul className="dash-appointments">
            {past.map((a) => (
              <li key={a.id} className="dash-appt dash-appt--muted">
                <div>
                  <b>{sessionTitle(a, role)}</b>
                  <p className="dash-appt-when">{formatSessionWhen(a.starts_at, a.timezone)}</p>
                  <span className="pill">{a.status.replace("_", " ")}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
