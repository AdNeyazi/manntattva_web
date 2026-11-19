import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, errorMessages, type PublicEvent } from "../api";
import { EVENT_KINDS, EVENT_MODES, formatWhen } from "../lib/content";
import "./Content.css";

export default function EventDetail() {
  const { slug = "" } = useParams();
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.events.get(slug)
      .then((d) => setEvent(d.event))
      .catch((err) => setError(errorMessages(err, "Event not found")[0]));
  }, [slug]);

  if (error) {
    return (
      <div className="page container">
        <p className="form-error">{error}</p>
        <Link to="/events">← All events</Link>
      </div>
    );
  }
  if (!event) return <p className="center-note">Loading…</p>;

  const kind = EVENT_KINDS.find((k) => k.id === event.kind)?.label;
  const mode = EVENT_MODES.find((k) => k.id === event.mode)?.label;

  return (
    <div className="page container narrow">
      <Link className="back-link" to="/events">← All events</Link>
      <span className="status-pill">{kind} · {mode}</span>
      <h1 style={{ marginTop: 12 }}>{event.title}</h1>
      <p className="content-meta">
        {formatWhen(event.starts_at)} – {formatWhen(event.ends_at)}
        <br />
        Hosted by <Link to={`/counsellors/${event.author.slug}`}>{event.author.full_name}</Link>
      </p>
      {event.location && <p><b>Venue:</b> {event.location}</p>}
      {event.meeting_url && (
        <p>
          <a className="card-link" href={event.meeting_url} target="_blank" rel="noreferrer">
            Join online →
          </a>
        </p>
      )}
      <div className="prose-block" style={{ marginTop: 18 }}>{event.body}</div>
    </div>
  );
}
