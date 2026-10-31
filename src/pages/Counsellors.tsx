import { useEffect, useState } from "react";
import { api, errorMessages, type CounsellorFilters, type CounsellorSummary, type Option } from "../api";
import CounsellorCard from "../components/CounsellorCard";
import "./Counsellors.css";

const MODES = [
  { id: "online", value: "online", label: "Online" },
  { id: "offline", value: "offline", label: "In person" },
];

const EMPTY_FILTERS: CounsellorFilters = { language: "", specialization: "", mode: "" };

function FilterField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; value: string; label: string }[];
}) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option.id} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function Counsellors() {
  const [filters, setFilters] = useState<CounsellorFilters>(EMPTY_FILTERS);
  const [languages, setLanguages] = useState<Option[]>([]);
  const [specializations, setSpecializations] = useState<Option[]>([]);
  const [items, setItems] = useState<CounsellorSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.lookups.languages().then((d) => setLanguages(d.languages)).catch(() => undefined);
    api.lookups.specializations().then((d) => setSpecializations(d.specializations)).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.counsellors
      .list(filters)
      .then((d) => {
        if (cancelled) return;
        setItems(d.counsellors);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessages(err, "Could not load counsellors")[0]);
      });
    return () => { cancelled = true; };
  }, [filters]);

  const set = (key: keyof CounsellorFilters) => (value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const filtering = Boolean(filters.language || filters.specialization || filters.mode);
  const languageOptions = languages.map((l) => ({ id: String(l.id), value: l.name, label: l.name }));
  const specialityOptions = specializations.map((s) => ({ id: String(s.id), value: s.name, label: s.name }));

  const countLabel =
    items === null
      ? "Loading…"
      : items.length === 0
        ? "No matches"
        : `${items.length} ${items.length === 1 ? "counsellor" : "counsellors"}`;

  return (
    <div className="counsellors-page">
      <header className="counsellors-hero">
        <div className="container">
          <div className="counsellors-hero-inner">
            <span className="eyebrow">Our team</span>
            <h1>
              Find a counsellor who <em>feels right</em>
            </h1>
            <p>
              Qualified practitioners you can filter by language, speciality, and how you would like to meet.
            </p>
          </div>
        </div>
      </header>

      <section className="counsellors-body container">
        <div className="counsellors-filters">
          <FilterField label="Language" value={filters.language ?? ""} onChange={set("language")} options={languageOptions} />
          <FilterField label="Speciality" value={filters.specialization ?? ""} onChange={set("specialization")} options={specialityOptions} />
          <FilterField label="Session type" value={filters.mode ?? ""} onChange={set("mode")} options={MODES} />
          {filtering && (
            <button type="button" className="btn btn-line btn-sm filter-clear" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear
            </button>
          )}
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        {!error && items === null && <p className="muted-center">Loading counsellors…</p>}

        {items !== null && (
          <div className="counsellors-meta">
            <p className="result-line">
              {items.length === 0
                ? "No counsellors match these filters"
                : "Browse profiles and book when you are ready"}
            </p>
            <span className="counsellors-count">{countLabel}</span>
          </div>
        )}

        {items !== null && items.length === 0 && (
          <div className="empty-state">
            <p>Try another language, speciality, or session type.</p>
            {filtering && (
              <button type="button" className="btn btn-indigo btn-sm" onClick={() => setFilters(EMPTY_FILTERS)}>
                Show everyone
              </button>
            )}
          </div>
        )}

        {items !== null && items.length > 0 && (
          <div className="counsellors-grid">
            {items.map((c) => <CounsellorCard key={c.id} c={c} />)}
          </div>
        )}
      </section>
    </div>
  );
}
