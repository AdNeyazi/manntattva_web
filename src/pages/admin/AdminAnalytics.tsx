import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages, type AdminAnalytics } from "../../api";

function StatusBars({ byStatus }: { byStatus: Record<string, number> }) {
  const entries = useMemo(() => {
    const rows = Object.entries(byStatus).filter(([, n]) => n > 0);
    const max = Math.max(1, ...rows.map(([, n]) => n));
    return rows.map(([status, count]) => ({ status, count, pct: (count / max) * 100 }));
  }, [byStatus]);

  if (entries.length === 0) {
    return <p className="admin-soon">No appointment data yet.</p>;
  }

  return (
    <div className="admin-bar-chart">
      {entries.map(({ status, count, pct }) => (
        <div key={status} className="admin-bar-row">
          <label htmlFor={`bar-${status}`}>{status.replace("_", " ")}</label>
          <div className="admin-bar-track" id={`bar-${status}`}>
            <div className="admin-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <output>{count}</output>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin
      .analytics()
      .then((d) => setData(d.analytics))
      .catch((err) => setError(errorMessages(err, "Could not load analytics")[0]));
  }, []);

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Admin</span>
        <h1>Analytics</h1>
        <p>
          Live metrics from your database
          {data?.generated_at && (
            <> · updated {new Date(data.generated_at).toLocaleString("en-IN")}</>
          )}
        </p>
      </header>

      {error && <div className="form-error" role="alert">{error}</div>}
      {!data && !error && <p className="muted-center">Loading analytics…</p>}

      {data && (
        <>
          <div className="admin-kpi-grid">
            <div className="admin-kpi"><b>{data.appointments.total}</b><span>All appointments</span></div>
            <div className="admin-kpi"><b>{data.appointments.upcoming}</b><span>Upcoming</span></div>
            <div className="admin-kpi"><b>{data.appointments.this_month}</b><span>This month</span></div>
            <div className="admin-kpi"><b>{data.appointments.last_7_days}</b><span>Created (7 days)</span></div>
            <div className="admin-kpi"><b>{data.users.clients}</b><span>Registered clients</span></div>
            <div className="admin-kpi"><b>{data.counsellors.published}</b><span>Published counsellors</span></div>
          </div>

          <div className="admin-panel">
            <h2>Sessions by status</h2>
            <StatusBars byStatus={data.appointments.by_status} />
          </div>

          <div className="admin-panel">
            <h2>Top counsellors by bookings</h2>
            {data.top_counsellors.length === 0 ? (
              <p className="admin-soon">No counsellor booking data yet.</p>
            ) : (
              <div className="table-wrap" style={{ padding: 0, boxShadow: "none", border: 0 }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Counsellor</th>
                      <th>Bookings</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_counsellors.map((c) => (
                      <tr key={c.counsellor_id}>
                        <td><b>{c.full_name}</b></td>
                        <td>{c.bookings}</td>
                        <td>
                          <Link className="card-link" to={`/counsellors/${c.slug}`}>View profile</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-panel">
            <h2>User breakdown</h2>
            <StatusBars
              byStatus={{
                clients: data.users.clients,
                counsellors: data.users.counsellors,
                admins: data.users.admins,
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
