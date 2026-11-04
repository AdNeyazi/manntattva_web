import { Link } from "react-router-dom";
import type { CounsellorSummary } from "../api";
import { offeredSessions, previewItems } from "../lib/counsellor";
import { initials } from "../lib/text";
import "./CounsellorCard.css";

export default function CounsellorCard({ c }: { c: CounsellorSummary }) {
  const modes = offeredSessions(c);
  const focus = previewItems(c.specializations, 3);
  const languages = previewItems(c.languages, 2);
  const years = c.experience_years;

  return (
    <Link className="c-card" to={`/counsellors/${c.slug}`}>
      <div className="c-card-media">
        {c.is_verified && <span className="c-card-verified">✓ Verified</span>}
        {c.photo_url ? (
          <img src={c.photo_url} alt="" />
        ) : (
          <span className="c-card-avatar" aria-hidden="true">{initials(c.full_name)}</span>
        )}
      </div>
      <div className="c-card-body">
        <h3>{c.full_name}</h3>
        {c.designation && <p className="c-card-role">{c.designation}</p>}
        {c.education && <p className="c-card-edu">{c.education}</p>}

        {(years !== null || languages.visible.length > 0) && (
          <ul className="c-card-meta">
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
          <div className="c-card-tags">
            {focus.visible.map((name) => <span key={name}>{name}</span>)}
            {focus.hidden > 0 && <span>+{focus.hidden}</span>}
          </div>
        )}

        {modes.length > 0 && (
          <div className="c-card-modes">
            {modes.map((mode) => <span key={mode}>{mode}</span>)}
          </div>
        )}

        <span className="c-card-cta">View profile</span>
      </div>
    </Link>
  );
}
