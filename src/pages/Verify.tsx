import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, errorMessages, type CounsellorSummary } from "../api";
import CounsellorCard from "../components/CounsellorCard";
import "./Content.css";

export default function Verify() {
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counsellor, setCounsellor] = useState<(CounsellorSummary & { registration_no: string }) | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCounsellor(null);
    try {
      const d = await api.counsellors.verify(id.trim());
      if (d.found && d.counsellor) setCounsellor(d.counsellor);
      else setError("No verified Manntattva counsellor is registered with that ID.");
    } catch (err) {
      setError(errorMessages(err, "No verified Manntattva counsellor is registered with that ID.")[0]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page container">
      <header className="page-head page-head--center">
        <span className="eyebrow eyebrow--light">Verification</span>
        <h1>Verify a karmic counsellor</h1>
        <p>Enter the unique registration ID issued by Manntattva to confirm a counsellor is verified on this platform.</p>
      </header>

      <form className="card form verify-form" onSubmit={onSubmit}>
        <label>
          Registration ID
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. CRR: A88156"
            required
          />
        </label>
        <button className="btn btn-gold" disabled={busy}>{busy ? "Checking…" : "Verify ID"}</button>
      </form>

      {error && (
        <div className="form-error verify-result" role="alert">{error}</div>
      )}

      {counsellor && (
        <div className="verify-result">
          <p className="form-ok" role="status">
            Verified. Registration ID <b>{counsellor.registration_no}</b> belongs to {counsellor.full_name}.
          </p>
          <div style={{ marginTop: 18, maxWidth: 360, marginInline: "auto" }}>
            <CounsellorCard c={counsellor} />
          </div>
          <p style={{ marginTop: 16 }}>
            <Link className="card-link" to={`/counsellors/${counsellor.slug}`}>Open full profile →</Link>
          </p>
        </div>
      )}
    </div>
  );
}
