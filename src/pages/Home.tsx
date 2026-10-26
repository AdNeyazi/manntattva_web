import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type CounsellorSummary } from "../api";
import { useAuth } from "../auth/AuthContext";
import CounsellorCard from "../components/CounsellorCard";
import { Mandala, Stars } from "../components/Decor";
import Footer from "../components/Footer";

// Simple line icons: each icon is a list of SVG path strings (24x24 grid).
const ICONS = {
  flask: ["M10 2v7.5L4 20a1 1 0 0 0 .9 1.5h14.2a1 1 0 0 0 .9-1.5L14 9.5V2", "M8.5 2h7"],
  sun: [
    "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
    "M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  ],
  heart: ["M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"],
  chat: ["M7.9 20A9 9 0 1 0 4 16.1L2 22z"],
  book: ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  calendar: ["M8 2v4M16 2v4M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
  smile: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"],
} as const;

type IconName = keyof typeof ICONS;

function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

const PILLARS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "flask",
    title: "Science",
    text: "Evidence-based practices of modern psychology guide every session and every course.",
  },
  {
    icon: "sun",
    title: "Wisdom",
    text: "The enduring wisdom of the mind is woven in, through karmic counselling and reflective practice.",
  },
  {
    icon: "heart",
    title: "Compassion",
    text: "A judgement-free space where deep mental wellness is made accessible to all.",
  },
];

const SERVICES: { icon: IconName; title: string; text: string; to?: string; cta?: string }[] = [
  { icon: "chat", title: "Talk to a Counsellor", text: "Audio or video sessions with certified counsellors, matched to your need and language.", to: "/signup", cta: "Get started" },
  { icon: "book", title: "Courses", text: "Karmic Counselling courses, recorded and offline, including a diploma with Jain University." },
  { icon: "calendar", title: "Workshops & Events", text: "Webinars, workshops, retreats and festivals, online and in person." },
  { icon: "smile", title: "Free Mind Check", text: "A short self-assessment to help you understand where you are today." },
];

const STEPS = [
  { n: "1", title: "Create your account", text: "Sign up in a minute. No payment needed to look around." },
  { n: "2", title: "Choose your counsellor", text: "Browse profiles by specialisation and language, and pick who feels right." },
  { n: "3", title: "Book and begin", text: "Pick a time, choose phone or video, and start your session." },
];

export default function Home() {
  const { user } = useAuth();
  const primaryTo = user ? "/dashboard" : "/signup";

  const [team, setTeam] = useState<CounsellorSummary[] | null>(null);

  useEffect(() => {
    api.counsellors
      .list({ limit: 4 })
      .then((d) => setTeam(d.counsellors))
      .catch(() => setTeam([]));
  }, []);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <Stars />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">The Science of Mind</span>
            <h1>
              Ancient wisdom. Modern psychology. <em>One calmer mind.</em>
            </h1>
            <p className="lead">
              Manntattva brings transformative psychological clarity and compassionate healing into
              everyday life, with certified counsellors, guided courses and a space free of judgement.
            </p>
            <div className="cta">
              <Link className="btn btn-gold" to={primaryTo}>Talk to a Counsellor</Link>
              <Link className="btn btn-ghost" to="/#services">Explore Services</Link>
            </div>
            <ul className="chips">
              <li>100% Confidential</li>
              <li>Certified Counsellors</li>
              <li>6 Languages</li>
              <li>Judgement-Free</li>
            </ul>
          </div>

          <div className="hero-art">
            <Mandala />
            <div className="float-chip chip-a"><b>Verified</b> counsellors</div>
            <div className="float-chip chip-b"><b>Phone · WhatsApp · Meet</b></div>
          </div>
        </div>
      </section>

      {/* ---------- About / pillars ---------- */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow eyebrow--light">Our approach</span>
            <h2>Where the science of mind meets inner healing</h2>
            <p>
              To nurture a healthier, compassionate society by making deep mental wellness, inner
              healing and psychological wisdom accessible to all.
            </p>
          </div>
          <div className="grid-3">
            {PILLARS.map((p) => (
              <article className="card pillar" key={p.title}>
                <span className="icon-badge"><Icon name={p.icon} /></span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section className="section section--tint" id="services">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow eyebrow--light">Services</span>
            <h2>Support for where you are right now</h2>
          </div>
          <div className="grid-4">
            {SERVICES.map((s) => (
              <article className="card service" key={s.title}>
                <span className="icon-badge icon-badge--gold"><Icon name={s.icon} /></span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                {s.to ? (
                  <Link className="card-link" to={s.to}>{s.cta} →</Link>
                ) : (
                  <span className="soon">Coming soon</span>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Counsellors ---------- */}
      <section className="section" id="counsellors">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow eyebrow--light">Our team</span>
            <h2>Meet your counsellors</h2>
            <p>Trained psychologists who blend clinical precision with a compassionate presence.</p>
          </div>
          {team !== null && team.length === 0 && (
            <p className="muted-center">Our counsellor profiles are coming soon.</p>
          )}
          {team !== null && team.length > 0 && (
            <>
              <div className="counsellor-grid">
                {team.map((c) => <CounsellorCard key={c.id} c={c} />)}
              </div>
              <div className="center-cta center-cta--light">
                <Link className="btn btn-indigo" to="/counsellors">See all counsellors</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="section section--night" id="how">
        <Stars />
        <div className="container">
          <div className="section-head section-head--light">
            <span className="eyebrow">How it works</span>
            <h2>Three simple steps to begin</h2>
          </div>
          <div className="grid-3">
            {STEPS.map((s) => (
              <article className="step" key={s.n}>
                <span className="step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
          <div className="center-cta">
            <Link className="btn btn-gold" to={primaryTo}>Begin your journey</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
