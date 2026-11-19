import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages, type Appointment } from "../../api";
import { formatSessionWhen } from "../../lib/booking";

export default function AdminAppointments() {
  const [items, setItems] = useState<Appointment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [busyId, setBusyId] = useState<number | null>(null);

  async function setPayment(id: number, value: "unpaid" | "paid" | "waived") {
    setBusyId(id);
    setError(null);
    try {
      const { appointment } = await api.admin.appointments.setPayment(id, value);
      setItems((list) => (list ?? []).map((a) => (a.id === id ? appointment : a)));
    } catch (err) {
      setError(errorMessages(err, "Could not update the payment status")[0]);
    } finally {
      setBusyId(null);
    }
  }

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
                </div>
                <label className="filter-field" style={{ maxWidth: 200, marginTop: 8 }}>
                  <span>Payment</span>
                  <select value={a.payment_status} disabled={busyId === a.id}
                    onChange={(e) => void setPayment(a.id, e.target.value as "unpaid" | "paid" | "waived")}>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="waived">Waived</option>
                  </select>
                </label>
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
