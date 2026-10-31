import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages, type AdminAnalytics } from "../../api";

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="admin-kpi">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

export default function AdminOverview() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin
      .analytics()
      .then((d) => setData(d.analytics))
      .catch((err) => setError(errorMessages(err, "Could not load overview")[0]));
  }, []);

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Admin</span>
        <h1>Overview</h1>
        <p>High-level snapshot of users, counsellors, and bookings across Manntattva.</p>
      </header>

      {error && <div className="form-error" role="alert">{error}</div>}

      {!data && !error && <p className="muted-center">Loading overview…</p>}

      {data && (
        <>
          <div className="admin-kpi-grid">
            <Kpi label="Total users" value={data.users.total} />
            <Kpi label="Clients" value={data.users.clients} />
            <Kpi label="Counsellors" value={data.counsellors.total} />
            <Kpi label="Upcoming sessions" value={data.appointments.upcoming} />
            <Kpi label="Bookings this month" value={data.appointments.this_month} />
            <Kpi label="New bookings (7d)" value={data.appointments.last_7_days} />
          </div>

          <div className="admin-panel">
            <h2>Quick actions</h2>
            <div className="dash-hero-actions">
              <Link className="btn btn-sm btn-indigo" to="/admin/counsellors">Manage counsellors</Link>
              <Link className="btn btn-sm btn-line" to="/admin/appointments">All appointments</Link>
              <Link className="btn btn-sm btn-line" to="/admin/analytics">Open analytics</Link>
              <Link className="btn btn-sm btn-line" to="/admin/users">Browse users</Link>
            </div>
          </div>

          <div className="admin-panel">
            <h2>Counsellor roster</h2>
            <p style={{ color: "var(--muted)", marginBottom: 12 }}>
              {data.counsellors.published} published · {data.counsellors.draft} draft ·{" "}
              {data.counsellors.verified} verified
            </p>
            {data.top_counsellors.length === 0 ? (
              <p className="admin-soon">No bookings yet — top counsellors will appear here.</p>
            ) : (
              <ul className="dash-sessions" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {data.top_counsellors.slice(0, 3).map((c) => (
                  <li key={c.counsellor_id} className="dash-session" style={{ gridTemplateColumns: "1fr auto" }}>
                    <div className="dash-session-body">
                      <h3>{c.full_name}</h3>
                      <p className="dash-session-meta">{c.bookings} total bookings</p>
                    </div>
                    <Link className="btn btn-sm btn-line" to={`/counsellors/${c.slug}`}>Profile</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </>
  );
}
