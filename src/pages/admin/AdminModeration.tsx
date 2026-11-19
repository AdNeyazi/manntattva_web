import { useEffect, useState } from "react";
import { api, errorMessages, type ContentStatus, type OwnerBlog, type OwnerEvent } from "../../api";
import { formatWhen, statusLabel } from "../../lib/content";
import "../Content.css";

type Kind = "blogs" | "events";
type Item = OwnerBlog | OwnerEvent;

export default function AdminModeration({ kind }: { kind: Kind }) {
  const [status, setStatus] = useState<ContentStatus | "">("pending");
  // Loaded items are stored with the queue they belong to, so "loading" is derived.
  const queueKey = `${kind}:${status}`;
  const [loaded, setLoaded] = useState<{ key: string; items: Item[] } | null>(null);
  const items = loaded?.key === queueKey ? loaded.items : null;
  const setItems = (update: (list: Item[] | null) => Item[]) =>
    setLoaded((l) => (l ? { ...l, items: update(l.items) } : l));
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const req = kind === "blogs" ? api.admin.blogs.list(status) : api.admin.events.list(status);
    req
      .then((d) => { if (!cancelled) setLoaded({ key: `${kind}:${status}`, items: d.items }); })
      .catch((err) => { if (!cancelled) setError(errorMessages(err, "Could not load queue")[0]); });
    return () => { cancelled = true; };
  }, [kind, status]);

  async function approve(id: number) {
    setBusyId(id);
    setError(null);
    try {
      const d = kind === "blogs" ? await api.admin.blogs.approve(id) : await api.admin.events.approve(id);
      setItems((list) => (list ?? []).map((x) => (x.id === id ? d.item : x)));
    } catch (err) {
      setError(errorMessages(err, "Could not approve")[0]);
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: number) {
    const note = window.prompt("Note for the counsellor (required for rejection)", "Please revise and resubmit.");
    if (note === null) return;
    setBusyId(id);
    setError(null);
    try {
      const d = kind === "blogs"
        ? await api.admin.blogs.reject(id, note)
        : await api.admin.events.reject(id, note);
      setItems((list) => (list ?? []).map((x) => (x.id === id ? d.item : x)));
    } catch (err) {
      setError(errorMessages(err, "Could not reject")[0]);
    } finally {
      setBusyId(null);
    }
  }

  const noun = kind === "blogs" ? "articles" : "events";

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Admin</span>
        <h1>Review {noun}</h1>
        <p>Approve counsellor {noun} to make them public, or send them back for revision.</p>
      </header>
      <label className="filter-field" style={{ maxWidth: 240, marginBottom: 18 }}>
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus | "")}>
          <option value="">All</option>
          <option value="pending">Awaiting approval</option>
          <option value="published">Live</option>
          <option value="rejected">Needs revision</option>
          <option value="draft">Draft</option>
        </select>
      </label>
      {error && <div className="form-error" role="alert">{error}</div>}
      {items === null && <p>Loading…</p>}
      {items && items.length === 0 && <p className="empty-state">Nothing in this queue.</p>}
      {items && items.length > 0 && (
        <div className="content-list">
          {items.map((item) => (
            <article className="content-card" key={item.id}>
              <span className={`status-pill status-pill--${item.status}`}>{statusLabel(item.status)}</span>
              <h3 style={{ marginTop: 8 }}>{item.title}</h3>
              <p className="content-meta">
                {item.author.full_name}
                {"starts_at" in item && item.starts_at ? ` · ${formatWhen(item.starts_at)}` : ""}
              </p>
              <p>{item.body.slice(0, 220)}{item.body.length > 220 ? "…" : ""}</p>
              {item.status === "pending" && (
                <div className="content-actions">
                  <button className="btn btn-sm btn-gold" disabled={busyId === item.id} onClick={() => void approve(item.id)}>
                    Approve & publish
                  </button>
                  <button className="btn btn-sm btn-line" disabled={busyId === item.id} onClick={() => void reject(item.id)}>
                    Request changes
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
