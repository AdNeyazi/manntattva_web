import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages, type OwnerEvent } from "../../api";
import { formatWhen, statusLabel } from "../../lib/content";
import "../Content.css";

export default function MyEvents() {
  const [items, setItems] = useState<OwnerEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    api.myEvents.list()
      .then((d) => setItems(d.events))
      .catch((err) => setError(errorMessages(err, "Could not load events")[0]));
  }

  useEffect(load, []);

  async function submit(id: number) {
    setBusyId(id);
    setError(null);
    try {
      const d = await api.myEvents.submit(id);
      setItems((list) => (list ?? []).map((x) => (x.id === id ? d.event : x)));
    } catch (err) {
      setError(errorMessages(err, "Could not submit")[0]);
    } finally {
      setBusyId(null);
    }
  }

  async function destroy(id: number) {
    if (!window.confirm("Delete this draft event?")) return;
    setBusyId(id);
    try {
      await api.myEvents.destroy(id);
      setItems((list) => (list ?? []).filter((x) => x.id !== id));
    } catch (err) {
      setError(errorMessages(err, "Could not delete")[0]);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Events</span>
        <h1>Workshops and gatherings</h1>
        <p>Create workshops, webinars, or retreats. They appear publicly only after admin approval.</p>
      </header>
      <p style={{ marginBottom: 18 }}>
        <Link className="btn btn-gold" to="/my/events/new">New event</Link>
      </p>
      {error && <div className="form-error" role="alert">{error}</div>}
      {items === null && <p>Loading…</p>}
      {items && items.length === 0 && <p className="empty-state">No events yet.</p>}
      {items && items.length > 0 && (
        <div className="content-list">
          {items.map((event) => (
            <article className="content-card" key={event.id}>
              <span className={`status-pill status-pill--${event.status}`}>{statusLabel(event.status)}</span>
              <h3 style={{ marginTop: 8 }}>{event.title}</h3>
              <p className="content-meta">{event.kind} · {event.mode} · {formatWhen(event.starts_at)}</p>
              {event.reviewer_note && event.status === "rejected" && (
                <p className="form-error" style={{ marginTop: 8 }}>{event.reviewer_note}</p>
              )}
              <div className="content-actions">
                {(event.status === "draft" || event.status === "rejected") && (
                  <>
                    <Link className="btn btn-sm btn-indigo" to={`/my/events/${event.id}`}>Edit</Link>
                    <button className="btn btn-sm btn-gold" disabled={busyId === event.id} onClick={() => void submit(event.id)}>
                      Submit for approval
                    </button>
                    <button className="btn btn-sm btn-line" disabled={busyId === event.id} onClick={() => void destroy(event.id)}>
                      Delete
                    </button>
                  </>
                )}
                {event.status === "published" && (
                  <Link className="card-link" to={`/events/${event.slug}`}>View live →</Link>
                )}
                {event.status === "pending" && <span className="fine">Waiting for admin review.</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
