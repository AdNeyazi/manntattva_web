import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages, type PublicEvent } from "../api";
import { EVENT_KINDS, EVENT_MODES, formatWhen } from "../lib/content";
import "./Content.css";

function kindLabel(kind: PublicEvent["kind"]) {
  return EVENT_KINDS.find((k) => k.id === kind)?.label ?? kind;
}
function modeLabel(mode: PublicEvent["mode"]) {
  return EVENT_MODES.find((k) => k.id === mode)?.label ?? mode;
}

export default function Events() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  // The result is stored with the tab it belongs to, so "loading" is derived instead of
  // being set inside the effect.
  const [result, setResult] = useState<{ tab: string; events: PublicEvent[] | null; error: string | null } | null>(null);
  const current = result?.tab === tab ? result : null;
  const items = current?.events ?? null;
  const error = current?.error ?? null;

  useEffect(() => {
    let cancelled = false;
    api.events.list(tab)
      .then((d) => { if (!cancelled) setResult({ tab, events: d.events, error: null }); })
      .catch((err) => {
        if (!cancelled) setResult({ tab, events: null, error: errorMessages(err, "Could not load events")[0] });
      });
    return () => { cancelled = true; };
  }, [tab]);

  return (
    <div className="page container">
      <header className="page-head page-head--center">
        <span className="eyebrow eyebrow--light">Gatherings</span>
        <h1>Workshops, webinars and retreats</h1>
        <p>Events listed here have been approved by the Manntattva admin team.</p>
      </header>
      <div className="center-cta" style={{ marginTop: 0, marginBottom: 24 }}>
        <button type="button" className={`btn btn-sm ${tab === "upcoming" ? "btn-gold" : "btn-line"}`} onClick={() => setTab("upcoming")}>Upcoming</button>
        {" "}
        <button type="button" className={`btn btn-sm ${tab === "past" ? "btn-gold" : "btn-line"}`} onClick={() => setTab("past")}>Past</button>
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      {items === null && !error && <p className="muted-center">Loading…</p>}
      {items && items.length === 0 && <p className="empty-state">No {tab} events yet.</p>}
      {items && items.length > 0 && (
        <div className="content-list">
          {items.map((event) => (
            <Link className="content-card" key={event.id} to={`/events/${event.slug}`}>
              <span className="status-pill">{kindLabel(event.kind)} · {modeLabel(event.mode)}</span>
              <h3 style={{ marginTop: 10 }}>{event.title}</h3>
              <p className="content-meta">
                {formatWhen(event.starts_at)} · {event.author.full_name}
              </p>
              <p>{event.body.slice(0, 160)}{event.body.length > 160 ? "…" : ""}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
