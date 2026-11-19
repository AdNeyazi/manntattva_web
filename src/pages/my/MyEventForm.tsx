import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, errorMessages, type EventInput } from "../../api";
import { EVENT_KINDS, EVENT_MODES, fromLocalInput, toLocalInput } from "../../lib/content";
import "../Content.css";

function defaultTimes(): Pick<EventInput, "starts_at" | "ends_at"> {
  const start = new Date();
  start.setDate(start.getDate() + 7);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start);
  end.setHours(12, 0, 0, 0);
  return { starts_at: start.toISOString(), ends_at: end.toISOString() };
}

const EMPTY: EventInput = {
  title: "",
  body: "",
  kind: "workshop",
  mode: "online",
  location: "",
  meeting_url: "",
  ...defaultTimes(),
};

export default function MyEventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState<EventInput>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.myEvents.get(Number(id))
      .then((d) => {
        const e = d.event;
        setForm({
          title: e.title,
          body: e.body,
          kind: e.kind,
          mode: e.mode,
          location: e.location ?? "",
          meeting_url: e.meeting_url ?? "",
          starts_at: e.starts_at,
          ends_at: e.ends_at,
        });
      })
      .catch((err) => setErrors(errorMessages(err, "Could not load event")));
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    try {
      if (editing && id) await api.myEvents.update(Number(id), form);
      else await api.myEvents.create(form);
      navigate("/my/events");
    } catch (err) {
      setErrors(errorMessages(err, "Could not save event"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Events</span>
        <h1>{editing ? "Edit event" : "New event"}</h1>
        <p>Save a draft, then submit it from the list. Online events need an https meeting link before submit.</p>
      </header>
      <form className="card form form-wide" onSubmit={onSubmit}>
        {errors.length > 0 && <div className="form-error" role="alert">{errors.map((m) => <div key={m}>{m}</div>)}</div>}
        <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <div className="entry-pair">
          <label>
            Type
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as EventInput["kind"] })}>
              {EVENT_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
          </label>
          <label>
            Mode
            <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as EventInput["mode"] })}>
              {EVENT_MODES.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
          </label>
        </div>
        <div className="entry-pair">
          <label>
            Starts
            <input
              type="datetime-local"
              required
              value={toLocalInput(form.starts_at)}
              onChange={(e) => setForm({ ...form, starts_at: fromLocalInput(e.target.value) })}
            />
          </label>
          <label>
            Ends
            <input
              type="datetime-local"
              required
              value={toLocalInput(form.ends_at)}
              onChange={(e) => setForm({ ...form, ends_at: fromLocalInput(e.target.value) })}
            />
          </label>
        </div>
        {(form.mode === "offline" || form.mode === "hybrid") && (
          <label>Venue / location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
        )}
        {(form.mode === "online" || form.mode === "hybrid") && (
          <label>Meeting URL<input type="url" placeholder="https://" value={form.meeting_url} onChange={(e) => setForm({ ...form, meeting_url: e.target.value })} /></label>
        )}
        <label>Description<textarea required rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
        <div className="content-actions">
          <button className="btn btn-gold" disabled={busy}>{busy ? "Saving…" : "Save draft"}</button>
          <Link className="btn btn-line" to="/my/events">Cancel</Link>
        </div>
      </form>
    </>
  );
}
