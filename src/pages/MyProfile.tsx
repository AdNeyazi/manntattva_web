import { useEffect, useState, type FormEvent } from "react";
import {
  api,
  errorMessages,
  type CounsellorAdmin,
  type Option,
  type ProfileUpdate,
  type SocialLinks,
} from "../api";

const SOCIAL_KEYS: (keyof SocialLinks)[] = ["instagram", "facebook", "linkedin", "youtube", "website"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMEZONES = ["Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Europe/London", "America/New_York", "UTC"];
const SLOT_LENGTHS = [30, 45, 60, 90];

function toForm(c: CounsellorAdmin): ProfileUpdate {
  return {
    designation: c.designation ?? "",
    education: c.education ?? "",
    bio: c.bio ?? "",
    methodology: c.methodology ?? "",
    experience_years: c.experience_years ?? "",
    offers_online: c.offers_online,
    offers_offline: c.offers_offline,
    offers_audio: c.offers_audio,
    offers_video: c.offers_video,
    social_links: { ...c.social_links },
    language_ids: c.language_ids,
    specialization_ids: c.specialization_ids,
    certifications: c.certifications.map((x) => ({ title: x.title, issuer: x.issuer ?? "", year: x.year ?? "" })),
    educations: (c.educations ?? []).map((x) => ({
      title: x.title, institution: x.institution ?? "", start_year: x.start_year ?? "", end_year: x.end_year ?? "",
    })),
    experiences: (c.experiences ?? []).map((x) => ({
      title: x.title,
      organisation: x.organisation ?? "",
      location: x.location ?? "",
      start_year: x.start_year ?? "",
      end_year: x.end_year ?? "",
    })),
    timezone: c.timezone || "Asia/Kolkata",
    slot_minutes: c.slot_minutes || 60,
    availability_rules: c.availability_rules ?? [],
  };
}

const toggle = (list: number[], id: number) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export default function MyProfile() {
  const [profile, setProfile] = useState<CounsellorAdmin | null>(null);
  const [form, setForm] = useState<ProfileUpdate | null>(null);
  const [languages, setLanguages] = useState<Option[]>([]);
  const [specializations, setSpecializations] = useState<Option[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.myProfile
      .get()
      .then((d) => { setProfile(d.counsellor); setForm(toForm(d.counsellor)); })
      .catch((err) => setErrors(errorMessages(err, "Could not load your profile")));
    api.lookups.languages().then((d) => setLanguages(d.languages)).catch(() => undefined);
    api.lookups.specializations().then((d) => setSpecializations(d.specializations)).catch(() => undefined);
  }, []);

  if (!form || !profile) {
    return errors.length > 0
      ? <p className="center-note">{errors[0]}</p>
      : <p className="center-note">Loading…</p>;
  }

  function setField<K extends keyof ProfileUpdate>(key: K, value: ProfileUpdate[K]) {
    setSaved(false);
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function setCert(index: number, patch: Partial<ProfileUpdate["certifications"][number]>) {
    setField("certifications", form!.certifications.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setPhotoError(null);
    setBusy(true);
    try {
      const d = await api.myProfile.uploadPhoto(file);
      setProfile((current) => (current ? { ...current, photo_url: d.counsellor.photo_url } : d.counsellor));
    } catch (err) {
      setPhotoError(errorMessages(err, "Could not upload that photo")[0]);
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    setPhotoError(null);
    setBusy(true);
    try {
      await api.myProfile.removePhoto();
      setProfile((current) => (current ? { ...current, photo_url: null } : current));
    } catch (err) {
      setPhotoError(errorMessages(err, "Could not remove the photo")[0]);
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSaved(false);
    setBusy(true);
    try {
      const d = await api.myProfile.update(form!);
      setProfile(d.counsellor);
      setForm(toForm(d.counsellor));
      setSaved(true);
    } catch (err) {
      setErrors(errorMessages(err, "Could not save your profile"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page container narrow">
      <header className="page-head">
        <h1>My profile</h1>
        <p>
          This is what people see on your public page.{" "}
          {profile.status === "published"
            ? "Your profile is live."
            : "Your profile is not published yet. An admin will publish it."}
        </p>
        <p className="fine">
          Registration number and the Verified badge are set by an admin:{" "}
          <b>{profile.registration_no || "not set"}</b>{profile.is_verified ? " · Verified" : ""}
        </p>
      </header>

      <form className="card form form-wide" onSubmit={onSubmit}>
        {errors.length > 0 && (
          <div className="form-error" role="alert">{errors.map((m) => <div key={m}>{m}</div>)}</div>
        )}
        {saved && <div className="form-ok" role="status">Saved.</div>}

        <fieldset>
          <legend>Profile photo</legend>
          <div className="photo-field">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="" />
            ) : (
              <span className="avatar" aria-hidden="true">{profile.full_name.slice(0, 1)}</span>
            )}
            <label>JPEG, PNG, or WebP, up to 5 MB
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
          </div>
          {profile.photo_url && (
            <button type="button" className="btn btn-sm btn-line" disabled={busy} onClick={removePhoto}>Remove photo</button>
          )}
          {photoError && <div className="form-error" role="alert">{photoError}</div>}
        </fieldset>

        <label>Designation
          <input value={form.designation} onChange={(e) => setField("designation", e.target.value)} />
        </label>
        <label>Education summary
          <input value={form.education} onChange={(e) => setField("education", e.target.value)} />
        </label>
        <p className="fine">The summary is shown only when you have not added education entries below.</p>
        <label>Years of experience
          <input
            type="number" min={0}
            value={form.experience_years}
            onChange={(e) => setField("experience_years", e.target.value === "" ? "" : Number(e.target.value))}
          />
        </label>
        <label>About you
          <textarea rows={6} value={form.bio} onChange={(e) => setField("bio", e.target.value)} />
        </label>
        <label>Your approach (methodology)
          <textarea rows={4} value={form.methodology} onChange={(e) => setField("methodology", e.target.value)} />
        </label>

        <fieldset>
          <legend>Session types you offer</legend>
          <label className="check"><input type="checkbox" checked={form.offers_online} onChange={(e) => setField("offers_online", e.target.checked)} /> Online</label>
          <label className="check"><input type="checkbox" checked={form.offers_offline} onChange={(e) => setField("offers_offline", e.target.checked)} /> In person</label>
          <label className="check"><input type="checkbox" checked={form.offers_audio} onChange={(e) => setField("offers_audio", e.target.checked)} /> Audio call</label>
          <label className="check"><input type="checkbox" checked={form.offers_video} onChange={(e) => setField("offers_video", e.target.checked)} /> Video call</label>
        </fieldset>

        <fieldset>
          <legend>Languages</legend>
          {languages.length === 0 && <span className="fine">No languages have been added yet.</span>}
          {languages.map((l) => (
            <label className="check" key={l.id}>
              <input type="checkbox" checked={form.language_ids.includes(l.id)} onChange={() => setField("language_ids", toggle(form.language_ids, l.id))} /> {l.name}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Specialities</legend>
          {specializations.map((s) => (
            <label className="check" key={s.id}>
              <input type="checkbox" checked={form.specialization_ids.includes(s.id)} onChange={() => setField("specialization_ids", toggle(form.specialization_ids, s.id))} /> {s.name}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Education history</legend>
          {form.educations.map((item, i) => (
            <div className="entry-item" key={i}>
              <input placeholder="Degree or qualification" value={item.title} onChange={(e) => setField("educations", form.educations.map((row, j) => j === i ? { ...row, title: e.target.value } : row))} />
              <input placeholder="Institution" value={item.institution} onChange={(e) => setField("educations", form.educations.map((row, j) => j === i ? { ...row, institution: e.target.value } : row))} />
              <div className="entry-pair">
                <input placeholder="Start year" type="number" value={item.start_year} onChange={(e) => setField("educations", form.educations.map((row, j) => j === i ? { ...row, start_year: e.target.value === "" ? "" : Number(e.target.value) } : row))} />
                <input placeholder="End year" type="number" value={item.end_year} onChange={(e) => setField("educations", form.educations.map((row, j) => j === i ? { ...row, end_year: e.target.value === "" ? "" : Number(e.target.value) } : row))} />
              </div>
              <button type="button" className="btn btn-sm btn-line" onClick={() => setField("educations", form.educations.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-line" onClick={() => setField("educations", [...form.educations, { title: "", institution: "", start_year: "", end_year: "" }])}>
            + Add education
          </button>
        </fieldset>

        <fieldset>
          <legend>Clinical experience</legend>
          {form.experiences.map((item, i) => (
            <div className="entry-item" key={i}>
              <input placeholder="Role" value={item.title} onChange={(e) => setField("experiences", form.experiences.map((row, j) => j === i ? { ...row, title: e.target.value } : row))} />
              <div className="entry-pair">
                <input placeholder="Organisation" value={item.organisation} onChange={(e) => setField("experiences", form.experiences.map((row, j) => j === i ? { ...row, organisation: e.target.value } : row))} />
                <input placeholder="Location" value={item.location} onChange={(e) => setField("experiences", form.experiences.map((row, j) => j === i ? { ...row, location: e.target.value } : row))} />
              </div>
              <div className="entry-pair">
                <input placeholder="Start year" type="number" value={item.start_year} onChange={(e) => setField("experiences", form.experiences.map((row, j) => j === i ? { ...row, start_year: e.target.value === "" ? "" : Number(e.target.value) } : row))} />
                <input placeholder="End year, blank if current" type="number" value={item.end_year} onChange={(e) => setField("experiences", form.experiences.map((row, j) => j === i ? { ...row, end_year: e.target.value === "" ? "" : Number(e.target.value) } : row))} />
              </div>
              <button type="button" className="btn btn-sm btn-line" onClick={() => setField("experiences", form.experiences.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-line" onClick={() => setField("experiences", [...form.experiences, { title: "", organisation: "", location: "", start_year: "", end_year: "" }])}>
            + Add experience
          </button>
        </fieldset>

        <fieldset>
          <legend>Weekly availability</legend>
          <p className="fine">These hours are shown on your public profile. Booking is not open yet.</p>
          <label>Timezone
            <select value={form.timezone} onChange={(e) => setField("timezone", e.target.value)}>
              {!TIMEZONES.includes(form.timezone) && <option value={form.timezone}>{form.timezone}</option>}
              {TIMEZONES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
            </select>
          </label>
          <label>Session length
            <select value={form.slot_minutes} onChange={(e) => setField("slot_minutes", Number(e.target.value))}>
              {SLOT_LENGTHS.map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
            </select>
          </label>
          {form.availability_rules.map((rule, i) => (
            <div className="entry-item" key={i}>
              <div className="entry-pair">
                <select value={rule.weekday} onChange={(e) => setField("availability_rules", form.availability_rules.map((row, j) => j === i ? { ...row, weekday: Number(e.target.value) } : row))}>
                  {WEEKDAYS.map((name, weekday) => <option key={name} value={weekday}>{name}</option>)}
                </select>
                <span />
              </div>
              <div className="entry-pair">
                <input type="time" value={rule.start_time} onChange={(e) => setField("availability_rules", form.availability_rules.map((row, j) => j === i ? { ...row, start_time: e.target.value } : row))} />
                <input type="time" value={rule.end_time} onChange={(e) => setField("availability_rules", form.availability_rules.map((row, j) => j === i ? { ...row, end_time: e.target.value } : row))} />
              </div>
              <button type="button" className="btn btn-sm btn-line" onClick={() => setField("availability_rules", form.availability_rules.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-line" onClick={() => setField("availability_rules", [...form.availability_rules, { weekday: 1, start_time: "09:00", end_time: "17:00" }])}>
            + Add hours
          </button>
        </fieldset>

        <fieldset>
          <legend>Certifications</legend>
          {form.certifications.map((c, i) => (
            <div className="cert-row" key={i}>
              <input placeholder="Title" value={c.title} onChange={(e) => setCert(i, { title: e.target.value })} />
              <input placeholder="Issued by" value={c.issuer} onChange={(e) => setCert(i, { issuer: e.target.value })} />
              <input
                placeholder="Year" type="number" value={c.year}
                onChange={(e) => setCert(i, { year: e.target.value === "" ? "" : Number(e.target.value) })}
              />
              <button type="button" className="btn btn-sm btn-line" onClick={() => setField("certifications", form.certifications.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-line" onClick={() => setField("certifications", [...form.certifications, { title: "", issuer: "", year: "" }])}>
            + Add certification
          </button>
        </fieldset>

        <fieldset>
          <legend>Links (start with https://)</legend>
          {SOCIAL_KEYS.map((key) => (
            <label key={key}>{key[0].toUpperCase() + key.slice(1)}
              <input
                type="url" placeholder="https://"
                value={form.social_links[key] ?? ""}
                onChange={(e) => setField("social_links", { ...form.social_links, [key]: e.target.value })}
              />
            </label>
          ))}
        </fieldset>

        <button className="btn btn-indigo" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>
      </form>
    </section>
  );
}
