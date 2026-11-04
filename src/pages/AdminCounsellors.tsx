import { useEffect, useState, type FormEvent } from "react";
import { api, errorMessages, type CounsellorAdmin, type NewCounsellor } from "../api";

const EMPTY: NewCounsellor = { full_name: "", email: "", password: "", designation: "" };

function Row({ c, onSaved }: { c: CounsellorAdmin; onSaved: (updated: CounsellorAdmin) => void }) {
  const [status, setStatus] = useState(c.status);
  const [verified, setVerified] = useState(c.is_verified);
  const [regNo, setRegNo] = useState(c.registration_no ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = status !== c.status || verified !== c.is_verified || regNo !== (c.registration_no ?? "");

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const d = await api.admin.counsellors.update(c.id, { status, is_verified: verified, registration_no: regNo });
      onSaved(d.counsellor);
    } catch (err) {
      setError(errorMessages(err, "Could not save")[0]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr>
      <td><b>{c.full_name}</b><br /><span className="fine">{c.email}</span></td>
      <td>
        <select value={status} onChange={(e) => setStatus(e.target.value as CounsellorAdmin["status"])}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </td>
      <td><label className="check"><input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} /> Verified</label></td>
      <td><input value={regNo} placeholder="e.g. CRR: A12345" onChange={(e) => setRegNo(e.target.value)} /></td>
      <td>
        <button className="btn btn-sm btn-indigo" disabled={!dirty || busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
        {error && <div className="form-error">{error}</div>}
      </td>
    </tr>
  );
}

export default function AdminCounsellors() {
  const [items, setItems] = useState<CounsellorAdmin[] | null>(null);
  const [form, setForm] = useState<NewCounsellor>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.admin.counsellors
      .list()
      .then((d) => setItems(d.counsellors))
      .catch((err) => setErrors(errorMessages(err, "Could not load counsellors")));
  }, []);

  const set = (key: keyof NewCounsellor) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setCreated(null);
    setBusy(true);
    try {
      const d = await api.admin.counsellors.create(form);
      setItems((list) => [...(list ?? []), d.counsellor]);
      setCreated(`${d.counsellor.full_name} was created. Share the email and first password with them.`);
      setForm(EMPTY);
    } catch (err) {
      setErrors(errorMessages(err, "Could not create the counsellor"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Admin</span>
        <h1>Manage counsellors</h1>
        <p>Create counsellor logins and control who is published and verified.</p>
      </header>

      <form className="card form form-inline" onSubmit={onCreate}>
        <h2>Add a counsellor</h2>
        {errors.length > 0 && <div className="form-error" role="alert">{errors.map((m) => <div key={m}>{m}</div>)}</div>}
        {created && <div className="form-ok" role="status">{created}</div>}
        <div className="admin-grid">
          <label>Full name<input required value={form.full_name} onChange={(e) => set("full_name")(e.target.value)} /></label>
          <label>Email<input required type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} /></label>
          <label>First password<input required minLength={6} type="text" value={form.password} onChange={(e) => set("password")(e.target.value)} /></label>
          <label>Designation<input value={form.designation} onChange={(e) => set("designation")(e.target.value)} /></label>
        </div>
        <button className="btn btn-indigo" disabled={busy}>{busy ? "Creating…" : "Create counsellor"}</button>
      </form>

      <div className="card table-wrap">
        {items === null ? (
          <p className="muted-center">Loading…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Counsellor</th><th>Status</th><th>Badge</th><th>Registration no.</th><th /></tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <Row
                  key={`${c.id}-${c.status}-${c.is_verified}-${c.registration_no ?? ""}`}
                  c={c}
                  onSaved={(u) => setItems((list) => (list ?? []).map((x) => (x.id === u.id ? u : x)))}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
