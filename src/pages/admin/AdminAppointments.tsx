import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages, type Appointment } from "../../api";
import { formatSessionWhen } from "../../lib/booking";

export default function AdminAppointments() {
  const [items, setItems] = useState<Appointment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    api.appointments
      .list()
      .then((d) => setItems(d.appointments))
      .catch((err) => setError(errorMessages(err, "Could not load appointments")[0]));
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    if (statusFilter === "all") return items;
    return items.filter((a) => a.status === statusFilter);
  }, [items, statusFilter]);

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Admin</span>
        <h1>Appointments</h1>
        <p>Every session on the platform — filter by status or open a counsellor profile.</p>
      </header>

      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="admin-panel">
        <label className="filter-field" style={{ maxWidth: 220 }}>
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No show</option>
          </select>
        </label>
      </div>

      {filtered === null && !error && <p className="muted-center">Loading appointments…</p>}

      {filtered && filtered.length === 0 && (
        <div className="admin-soon">No appointments match this filter.</div>
      )}

      {filtered && filtered.length > 0 && (
        <ul className="dash-sessions">
          {filtered.map((a) => (
            <li key={a.id} className="dash-session">
              <div className="dash-session-body">
                <h3>
                  {a.student?.full_name ?? "Client"} with {a.counsellor.full_name}
                </h3>
                {a.student?.email && <p className="dash-session-meta">{a.student.email}</p>}
                <p className="dash-session-when">{formatSessionWhen(a.starts_at, a.timezone)}</p>
                <div className="dash-session-tags">
                  <span className="dash-tag">{a.status.replace("_", " ")}</span>
                  <span className="dash-tag dash-tag--mode">{a.payment_status.replace("_", " ")}</span>
                </div>
                {a.note && <p className="dash-session-note"><b>Note:</b> {a.note}</p>}
              </div>
              <div className="dash-session-actions">
                <Link className="btn btn-sm btn-line" to={`/counsellors/${a.counsellor.slug}`}>
                  Counsellor
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
