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

      <div className="admin-panel admin-panel--toolbar">
        <label className="filter-field" style={{ maxWidth: 220, margin: 0 }}>
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No show</option>
          </select>
        </label>
        {filtered && (
          <span className="admin-table-count">
            {filtered.length} {filtered.length === 1 ? "row" : "rows"}
          </span>
        )}
      </div>

      {filtered === null && !error && <p className="muted-center">Loading appointments…</p>}

      {filtered && filtered.length === 0 && (
        <div className="admin-soon">No appointments match this filter.</div>
      )}

      {filtered && filtered.length > 0 && (
        <div className="admin-panel admin-panel--flush">
          <div className="admin-table-scroll">
            <table className="admin-appt-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Client</th>
                  <th>Counsellor</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Note</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="admin-appt-when">{formatSessionWhen(a.starts_at, a.timezone)}</td>
                    <td>
                      <b>{a.student?.full_name ?? "—"}</b>
                      {a.student?.email && (
                        <span className="admin-appt-sub">{a.student.email}</span>
                      )}
                    </td>
                    <td>
                      <b>{a.counsellor.full_name}</b>
                      {a.counsellor.designation && (
                        <span className="admin-appt-sub">{a.counsellor.designation}</span>
                      )}
                    </td>
                    <td>
                      <span className="dash-tag">{a.status.replace("_", " ")}</span>
                    </td>
                    <td>
                      <span className="dash-tag dash-tag--mode">{a.payment_status.replace("_", " ")}</span>
                    </td>
                    <td className="admin-appt-note">{a.note ? a.note : "—"}</td>
                    <td className="admin-appt-link">
                      <Link className="card-link" to={`/counsellors/${a.counsellor.slug}`}>
                        Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
