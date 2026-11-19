import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, errorMessages, type AdminAnalytics } from "../../api";

const GOLD = "#D4AF37";
const FOREST = "#1A332E";
const SAGE = "#5A6B66";
const CREAM = "#E8C547";
const MUTED = "#C5D0CA";

const PIE_COLORS = [GOLD, FOREST, SAGE, CREAM, MUTED];

function ChartCard({
  title,
  empty,
  children,
}: {
  title: string;
  empty?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="admin-panel">
      <h2>{title}</h2>
      {empty ? <p className="admin-soon">No data yet.</p> : <div className="admin-chart">{children}</div>}
    </div>
  );
}

function tooltipStyle() {
  return {
    borderRadius: 12,
    border: "1px solid var(--lavender-100)",
    fontSize: 13,
  };
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

  const statusData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.appointments.by_status)
      .filter(([, n]) => n > 0)
      .map(([name, value]) => ({ name: name.replace("_", " "), value }));
  }, [data]);

  const userData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Clients", value: data.users.clients },
      { name: "Counsellors", value: data.users.counsellors },
      { name: "Admins", value: data.users.admins },
    ].filter((d) => d.value > 0);
  }, [data]);

  const counsellorMix = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Published", value: data.counsellors.published },
      { name: "Draft", value: data.counsellors.draft },
      { name: "Verified", value: data.counsellors.verified },
    ];
  }, [data]);

  const weekSeries = data?.appointments.last_7_days_series ?? [];
  const top = data?.top_counsellors ?? [];

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

          <div className="admin-chart-grid">
            <ChartCard title="Bookings created (last 7 days)" empty={weekSeries.every((d) => d.count === 0)}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={weekSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={GOLD} stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
                  <XAxis dataKey="label" tick={{ fill: SAGE, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: SAGE, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle()} />
                  <Area type="monotone" dataKey="count" name="Bookings" stroke={GOLD} strokeWidth={2.5} fill="url(#goldFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Sessions by status" empty={statusData.length === 0}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                    {statusData.map((_, i) => (
                      <Cell key={statusData[i]!.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top counsellors by bookings" empty={top.length === 0}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={top} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={MUTED} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: SAGE, fontSize: 12 }} axisLine={false} />
                  <YAxis type="category" dataKey="full_name" width={110} tick={{ fill: FOREST, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle()} />
                  <Bar dataKey="bookings" name="Bookings" fill={FOREST} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {top.length > 0 && (
                <p className="fine" style={{ marginTop: 8 }}>
                  {top.map((c, i) => (
                    <span key={c.counsellor_id}>
                      {i > 0 && " · "}
                      <Link to={`/counsellors/${c.slug}`}>{c.full_name}</Link>
                    </span>
                  ))}
                </p>
              )}
            </ChartCard>

            <ChartCard title="Users by role" empty={userData.length === 0}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={userData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={88}>
                    {userData.map((_, i) => (
                      <Cell key={userData[i]!.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Counsellor roster mix" empty={counsellorMix.every((d) => d.value === 0)}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={counsellorMix} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MUTED} />
                <XAxis dataKey="name" tick={{ fill: SAGE, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: SAGE, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle()} />
                <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                  {counsellorMix.map((row, i) => (
                    <Cell key={row.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </>
  );
}
