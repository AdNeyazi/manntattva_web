import { useEffect, useState } from "react";
import { api, errorMessages, type CounsellorFilters, type CounsellorSummary, type Option } from "../api";
import CounsellorCard from "../components/CounsellorCard";

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

  // Filter dropdown options: loaded once.
  useEffect(() => {
    api.lookups.languages().then((d) => setLanguages(d.languages)).catch(() => undefined);
    api.lookups.specializations().then((d) => setSpecializations(d.specializations)).catch(() => undefined);
  }, []);

  // The list reloads whenever a filter changes.
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

  return (
    <section className="page container counsellors">
      <header className="page-head page-head--center">
        <span className="eyebrow eyebrow--light">Our team</span>
        <h1>Find a counsellor who feels right</h1>
        <p>Qualified practitioners you can filter by language, speciality, and how you would like to meet.</p>
      </header>

      <div className="filter-bar">
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
        <p className="result-line">
          {items.length === 0
            ? "No counsellors match these filters"
            : `${items.length} ${items.length === 1 ? "counsellor" : "counsellors"}`}
        </p>
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
        <div className="counsellor-grid">
          {items.map((c) => <CounsellorCard key={c.id} c={c} />)}
        </div>
      )}
    </section>
  );
}
