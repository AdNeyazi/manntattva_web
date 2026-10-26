import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError, errorMessages, type CounsellorDetail, type ExperienceRecord, type EducationRecord } from "../api";
import { offeredSessions, previewItems } from "../lib/counsellor";
import { initials, isWebUrl } from "../lib/text";
import "./CounsellorProfile.css";

type LoadState =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; counsellor: CounsellorDetail };

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  spark: "M12 3.2 13.4 8 18.2 9.4 13.4 10.8 12 15.6 10.6 10.8 5.8 9.4 10.6 8 12 3.2z",
  chat: "M5.5 6.5h13v8.2h-8.2L6.5 18v-3.3h-1V6.5z",
  person: "M12 12.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM6.2 19.2c.5-2.5 2.7-3.9 5.8-3.9s5.3 1.4 5.8 3.9",
  book: "M6 5.2h8.8A2.2 2.2 0 0 1 17 7.4V19l-2.4-1.3L12.2 19 9.8 17.7 7.4 19 5 17.7V6.4A1.2 1.2 0 0 1 6 5.2z",
  check: "M5 12.5 9.2 16.8 19 7",
};

function BookAction({ firstName }: { firstName: string }) {
  return (
    <>
      <button className="cprofile-book" disabled>Book a session with {firstName}</button>
      <p className="cprofile-fine">Online booking opens soon.</p>
    </>
  );
}

function yearSpan(start: number | null, end: number | null): string | null {
  if (start && end) return `${start} – ${end}`;
  if (start) return `${start} – Present`;
  if (end) return String(end);
  return null;
}

function formatSlot(value: string): string {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const clock = hour % 12 || 12;
  return `${clock}:${minuteText} ${suffix}`;
}

function formatWhen(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
    timeZone: timeZone || "Asia/Kolkata",
  }).format(new Date(iso));
}

function formatDay(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function Timeline({ items }: { items: Array<EducationRecord | ExperienceRecord> }) {
  return (
    <ul className="cprofile-timeline">
      {items.map((item, index) => {
        const place = "organisation" in item
          ? [item.organisation, item.location].filter(Boolean).join(" · ")
          : item.institution;
        const years = yearSpan(item.start_year, item.end_year);
        return (
          <li key={`${item.title}-${index}`}>
            <b>{item.title}</b>
            {years && <span>{years}</span>}
            {place && <span>{place}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function Availability({ counsellor }: { counsellor: CounsellorDetail }) {
  const days = counsellor.availability ?? [];
  const [selected, setSelected] = useState(days[0]?.date ?? "");
  if (!counsellor.next_available_at && days.length === 0) return null;
  const chosen = days.find((day) => day.date === selected) ?? days[0];

  return (
    <Block icon={ICONS.chat} title="Availability">
      <p className="cprofile-avail-note">Tap a date to see open times. Booking is not open yet.</p>
      <div className="cprofile-dates">
        {days.map((day) => (
          <button
            key={day.date}
            type="button"
            className="cprofile-date"
            aria-pressed={day.date === chosen?.date}
            onClick={() => setSelected(day.date)}
          >
            {formatDay(day.date)}
          </button>
        ))}
      </div>
      {chosen && (
        <div className="cprofile-slots">
          {chosen.slots.map((slot) => <span key={slot}>{formatSlot(slot)}</span>)}
        </div>
      )}
    </Block>
  );
}

function Block({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <article className="cprofile-block">
      <h2>
        <span className="cprofile-block-icon"><Icon d={icon} /></span>
        {title}
      </h2>
      {children}
    </article>
  );
}

export default function CounsellorProfile() {
  const { slug = "" } = useParams();
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    api.counsellors
      .get(slug)
      .then((d) => { if (!cancelled) setState({ kind: "ready", counsellor: d.counsellor }); })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setState({ kind: "missing" });
        else setState({ kind: "error", message: errorMessages(err, "Could not load this profile")[0] });
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (state.kind === "loading") {
    return <section className="cprofile"><p className="cprofile-note">Loading…</p></section>;
  }
  if (state.kind === "missing") {
    return (
      <section className="cprofile">
        <p className="cprofile-note">
          We could not find this counsellor. <Link to="/counsellors">See all counsellors</Link>
        </p>
      </section>
    );
  }
  if (state.kind === "error") {
    return <section className="cprofile"><p className="cprofile-note">{state.message}</p></section>;
  }

  const c = state.counsellor;
  const modes = offeredSessions(c);
  const links = Object.entries(c.social_links).filter(([, url]) => isWebUrl(url));
  const focus = previewItems(c.specializations, 3);
  const firstName = c.full_name.split(" ")[0] || c.full_name;
  const facts = [
    c.experience_years !== null ? `${c.experience_years} years of experience` : null,
    c.registration_no ? `Registration: ${c.registration_no}` : null,
  ].filter((item): item is string => item !== null);

  return (
    <section className="cprofile">
      <div className="cprofile-wrap">
        <nav className="cprofile-crumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link to="/counsellors">Counsellors</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{c.full_name}</span>
        </nav>

        <Link className="cprofile-back" to="/counsellors">← All counsellors</Link>

        <div className="cprofile-hero">
          <div className="cprofile-hero-top">
            <div className="cprofile-portrait">
              {c.photo_url ? <img src={c.photo_url} alt="" /> : <span className="cprofile-initials" aria-hidden="true">{initials(c.full_name)}</span>}
              {c.is_verified && (
                <span className="cprofile-verified"><i aria-hidden="true">✓</i> Verified</span>
              )}
            </div>

            <div className="cprofile-identity">
              <h1>{c.full_name}</h1>
              {c.designation && <p className="cprofile-role">{c.designation}</p>}
              {facts.length > 0 && <p className="cprofile-meta">{facts.join(" · ")}</p>}

              {c.specializations.length > 0 && (
                <div className="cprofile-chips">
                  {focus.visible.map((name) => <span key={name}>{name}</span>)}
                  {focus.hidden > 0 && <span>+{focus.hidden}</span>}
                </div>
              )}
            </div>
          </div>

          {c.bio && <p className="cprofile-excerpt">{c.bio}</p>}

          {modes.length > 0 && (
            <div className="cprofile-modes">
              {modes.map((mode) => (
                <span key={mode}><Icon d={ICONS.chat} />{mode}</span>
              ))}
            </div>
          )}

          {c.next_available_at && (
            <p className="cprofile-next">Next available: {formatWhen(c.next_available_at, c.timezone)}</p>
          )}

          <div className="cprofile-actions"><BookAction firstName={firstName} /></div>

          {links.length > 0 && (
            <div className="cprofile-social">
              {links.map(([name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer">{name}</a>
              ))}
            </div>
          )}
        </div>

        {(c.specializations.length > 0 || c.languages.length > 0 || modes.length > 0) && (
          <div className="cprofile-stats">
            {c.specializations.length > 0 && (
              <div className="cprofile-stat">
                <span className="cprofile-stat-icon"><Icon d={ICONS.spark} /></span>
                <span><b>{c.specializations.length}</b><small>Specializations</small></span>
              </div>
            )}
            {c.languages.length > 0 && (
              <div className="cprofile-stat">
                <span className="cprofile-stat-icon"><Icon d={ICONS.chat} /></span>
                <span><b>{c.languages.length}</b><small>Languages</small></span>
              </div>
            )}
            {modes.length > 0 && (
              <div className="cprofile-stat">
                <span className="cprofile-stat-icon"><Icon d={ICONS.person} /></span>
                <span><b>{modes.length}</b><small>Session modes</small></span>
              </div>
            )}
          </div>
        )}

        {c.languages.length > 0 && <p className="cprofile-speaks">Speaks: {c.languages.join(", ")}</p>}

        <div className="cprofile-blocks">
          {c.bio && <Block icon={ICONS.person} title="About"><p>{c.bio}</p></Block>}
          {c.methodology && <Block icon={ICONS.spark} title="Approach & methodology"><p>{c.methodology}</p></Block>}
          {(c.educations?.length ?? 0) > 0 ? (
            <Block icon={ICONS.book} title="Education"><Timeline items={c.educations} /></Block>
          ) : c.education ? (
            <Block icon={ICONS.book} title="Education"><p className="cprofile-edu">{c.education}</p></Block>
          ) : null}
          {(c.experiences?.length ?? 0) > 0 && (
            <Block icon={ICONS.person} title="Clinical experience"><Timeline items={c.experiences} /></Block>
          )}
          {c.specializations.length > 0 && (
            <Block icon={ICONS.spark} title="Specialises in">
              <div className="cprofile-tags">
                {c.specializations.map((name) => <span key={name}>{name}</span>)}
              </div>
            </Block>
          )}
          {c.certifications.length > 0 && (
            <Block icon={ICONS.check} title="Certifications">
              <ul className="cprofile-certs">
                {c.certifications.map((cert, i) => (
                  <li key={`${cert.title}-${i}`}>
                    <i aria-hidden="true">✓</i>
                    <span>
                      <b>{cert.title}</b>
                      {(cert.issuer || cert.year) && (
                        <span> · {[cert.issuer, cert.year].filter(Boolean).join(", ")}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Block>
          )}
          <Availability key={c.slug} counsellor={c} />
        </div>

        <div className="cprofile-cta">
          <h2>Ready to start your journey?</h2>
          <p>Take the first step. Book a session with {firstName} when online booking opens.</p>
          <BookAction firstName={firstName} />
        </div>
      </div>
    </section>
  );
}
