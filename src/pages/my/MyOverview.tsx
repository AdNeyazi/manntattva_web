import { useEffect, useState } from "react";
import "../Content.css";
import { Link } from "react-router-dom";
import { api, errorMessages, type Appointment, type OwnerBlog, type OwnerEvent } from "../../api";
import { statusLabel } from "../../lib/content";

export default function MyOverview() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blogs, setBlogs] = useState<OwnerBlog[]>([]);
  const [events, setEvents] = useState<OwnerEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Frozen once per mount so render stays pure.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    Promise.all([api.appointments.list(), api.myBlogs.list(), api.myEvents.list()])
      .then(([a, b, e]) => {
        setAppointments(a.appointments);
        setBlogs(b.blogs);
        setEvents(e.events);
      })
      .catch((err) => setError(errorMessages(err, "Could not load your desk")[0]));
  }, []);

  const upcoming = appointments.filter(
    (a) => a.status === "confirmed" && new Date(a.starts_at).getTime() > now,
  );
  const pendingBlogs = blogs.filter((b) => b.status === "pending").length;
  const pendingEvents = events.filter((e) => e.status === "pending").length;
  const liveBlogs = blogs.filter((b) => b.status === "published").length;
  const liveEvents = events.filter((e) => e.status === "published").length;

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Counsellor</span>
        <h1>Dashboard</h1>
        <p>Sessions you have booked, plus blogs and events waiting on Manntattva approval.</p>
      </header>

      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="admin-kpi-grid">
        <div className="admin-kpi"><b>{upcoming.length}</b><span>Upcoming sessions</span></div>
        <div className="admin-kpi"><b>{pendingBlogs + pendingEvents}</b><span>Awaiting approval</span></div>
        <div className="admin-kpi"><b>{liveBlogs}</b><span>Live articles</span></div>
        <div className="admin-kpi"><b>{liveEvents}</b><span>Live events</span></div>
      </div>

      <div className="admin-panel">
        <h2>Publish</h2>
        <p className="fine" style={{ marginBottom: 14 }}>
          Drafts stay private. Submit them for the admin team; they go live only after approval.
        </p>
        <div className="content-actions">
          <Link className="btn btn-sm btn-gold" to="/my/blogs/new">Write an article</Link>
          <Link className="btn btn-sm btn-indigo" to="/my/events/new">Create an event</Link>
          <Link className="btn btn-sm btn-line" to="/my/profile">Edit profile</Link>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Upcoming sessions</h2>
        {upcoming.length === 0 ? (
          <p className="fine">No upcoming client sessions.</p>
        ) : (
          <ul className="facts">
            {upcoming.slice(0, 5).map((a) => (
              <li key={a.id}>
                <b>{a.student?.full_name ?? "Client"}</b> — {new Date(a.starts_at).toLocaleString("en-IN")}
              </li>
            ))}
          </ul>
        )}
        <Link className="card-link" to="/dashboard">Open my account →</Link>
      </div>

      <div className="admin-panel">
        <h2>Recent content</h2>
        {[...blogs, ...events].length === 0 && <p className="fine">You have not created blogs or events yet.</p>}
        <ul className="facts">
          {blogs.slice(0, 3).map((b) => (
            <li key={`b-${b.id}`}><b>{b.title}</b> — {statusLabel(b.status)}</li>
          ))}
          {events.slice(0, 3).map((e) => (
            <li key={`e-${e.id}`}><b>{e.title}</b> — {statusLabel(e.status)}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
