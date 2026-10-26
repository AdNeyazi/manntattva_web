import { Link } from "react-router-dom";
import type { CounsellorSummary } from "../api";
import { offeredSessions, previewItems } from "../lib/counsellor";
import { initials } from "../lib/text";

export default function CounsellorCard({ c }: { c: CounsellorSummary }) {
  const modes = offeredSessions(c);
  const focus = previewItems(c.specializations, 3);
  const languages = previewItems(c.languages, 2);
  const years = c.experience_years;

  return (
    <Link className="counsellor-card" to={`/counsellors/${c.slug}`}>
      {c.photo_url ? (
        <img className="avatar avatar-photo" src={c.photo_url} alt="" />
      ) : (
        <span className="avatar" aria-hidden="true">{initials(c.full_name)}</span>
      )}
      <h3>{c.full_name}</h3>
      {c.designation && <p className="counsellor-role">{c.designation}</p>}
      {c.education && <p className="counsellor-edu">{c.education}</p>}
      {c.is_verified && <span className="verified">✓ Verified</span>}

      {(years !== null || languages.visible.length > 0) && (
        <ul className="counsellor-meta">
          {years !== null && <li>{years} {years === 1 ? "year" : "years"}</li>}
          {languages.visible.length > 0 && (
            <li>
              {languages.visible.join(", ")}
              {languages.hidden > 0 && ` +${languages.hidden}`}
            </li>
          )}
        </ul>
      )}

      {focus.visible.length > 0 && (
        <div className="tags counsellor-tags">
          {focus.visible.map((name) => <span key={name}>{name}</span>)}
          {focus.hidden > 0 && <span>+{focus.hidden}</span>}
        </div>
      )}

      {modes.length > 0 && (
        <div className="mode-chips counsellor-modes">
          {modes.map((mode) => <span key={mode}>{mode}</span>)}
        </div>
      )}

      <span className="card-link">View profile</span>
    </Link>
  );
}
