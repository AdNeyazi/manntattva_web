import { useEffect, useState } from "react";
import { api, errorMessages, type Option } from "../../api";

export default function AdminLookups() {
  const [languages, setLanguages] = useState<Option[] | null>(null);
  const [specializations, setSpecializations] = useState<Option[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.lookups.languages(), api.lookups.specializations()])
      .then(([lang, spec]) => {
        setLanguages(lang.languages);
        setSpecializations(spec.specializations);
      })
      .catch((err) => setError(errorMessages(err, "Could not load lookups")[0]));
  }, []);

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Admin</span>
        <h1>Lookups</h1>
        <p>Languages and specializations used for counsellor filters and profiles.</p>
      </header>

      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="admin-panel">
        <h2>Languages</h2>
        {!languages && !error && <p>Loading…</p>}
        {languages && (
          <div className="tags">
            {languages.map((l) => (
              <span key={l.id}>{l.name}</span>
            ))}
          </div>
        )}
        <p className="fine" style={{ marginTop: 14 }}>
          Editing lookup values in the admin UI is coming soon. Contact engineering to add languages or specializations in the database.
        </p>
      </div>

      <div className="admin-panel">
        <h2>Specializations</h2>
        {!specializations && !error && <p>Loading…</p>}
        {specializations && (
          <div className="tags">
            {specializations.map((s) => (
              <span key={s.id}>{s.name}</span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
