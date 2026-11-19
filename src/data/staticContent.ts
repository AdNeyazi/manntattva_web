import type { CounsellorDetail, CounsellorFilters, PublicBlog, PublicEvent } from "../api";

// ponytail: stand-in catalogue until these come from the API again.

const base = {
  is_verified: true,
  offers_online: true,
  offers_offline: true,
  offers_audio: true,
  offers_video: true,
  photo_url: null,
  experience_years: null,
  methodology: null,
  social_links: {},
  certifications: [],
  timezone: "Asia/Kolkata",
  slot_minutes: 50,
  next_available_at: null,
  availability: [],
} satisfies Partial<CounsellorDetail>;

export const STATIC_COUNSELLORS: CounsellorDetail[] = [
  {
    ...base,
    id: 1,
    slug: "puja-jain",
    full_name: "Puja Jain",
    designation: "Senior Psychologist and Research Lead",
    education: "M.A. Clinical Psychology | PGD Rehabilitation Psychology (CRR: A88156) | CMTAI (UNESCO) | DVR (MR)",
    registration_no: "CRR: A88156",
    languages: ["English", "Hindi", "Kannada"],
    specializations: ["Clinical intervention", "Couples therapy", "Trauma recovery", "Conflict resolution"],
    bio: "Puja Jain is a Senior Psychologist and Research Lead specializing in clinical intervention, conflict resolution, and couples therapy. An innovator in psychological assessment, she designed the Kashay-The Four Emotion Test and teaches karmic counselling at the postgraduate level at Jain University. Blending empirical research with expressive arts and creative movement therapy, Puja brings a published, evidence-backed approach to emotional regulation, trauma recovery, and holistic mental wellness.",
    educations: [
      { title: "M.A. Clinical Psychology", institution: null, start_year: null, end_year: null },
      { title: "PGD Rehabilitation Psychology", institution: "CRR: A88156", start_year: null, end_year: null },
      { title: "CMTAI", institution: "UNESCO", start_year: null, end_year: null },
      { title: "DVR (MR)", institution: null, start_year: null, end_year: null },
    ],
    experiences: [
      { title: "Senior Psychologist and Research Lead", organisation: "Mann-Tattva", location: null, start_year: null, end_year: null },
      { title: "Postgraduate faculty, karmic counselling", organisation: "Jain University", location: null, start_year: null, end_year: null },
    ],
  },
  {
    ...base,
    id: 2,
    slug: "chinmai-hemanth",
    full_name: "Chinmai Hemanth",
    designation: "Psychologist, Educator and Research Analyst",
    education: "M.A. Psychology | Dip. Clinical Hypnosis & Hypnotherapy | PGD Yoga Studies",
    registration_no: null,
    languages: ["English", "Hindi", "Kannada"],
    specializations: ["Clinical hypnosis", "Positive psychology", "Yoga-informed therapy"],
    bio: "Chinmai Hemanth is a psychologist, educator, and research analyst known for a grounded, deeply transformative approach to therapy and teaching. Whether mentoring postgraduates at Jain University or guiding clients one-on-one, her sessions move beyond routine theory—blending clinical hypnosis, yogic wisdom, and belief-modification science into clear, experiential breakthroughs. A published researcher in positive psychology, Chinmai connects with clients and students through genuine intellectual depth and empathetic presence, creating an authentic space where complex psychological concepts turn into real, lasting personal change.",
    educations: [
      { title: "M.A. Psychology", institution: null, start_year: null, end_year: null },
      { title: "Dip. Clinical Hypnosis & Hypnotherapy", institution: null, start_year: null, end_year: null },
      { title: "PGD Yoga Studies", institution: null, start_year: null, end_year: null },
    ],
    experiences: [
      { title: "Postgraduate mentor", organisation: "Jain University", location: null, start_year: null, end_year: null },
    ],
  },
  {
    ...base,
    id: 3,
    slug: "saundaryima-malviya",
    full_name: "Saundaryima Malviya",
    designation: "Counselling Psychologist",
    education: "M.A. Psychology | M.Ed. | B.Ed. | B.Sc. Mathematics | UGC-NET",
    registration_no: null,
    languages: ["English", "Hindi"],
    specializations: ["Anxiety", "Cognitive reframing", "Resilience"],
    bio: "One of our core pillars at Mann-Tattva, Saundaryima Malviya is a high-impact Counselling Psychologist transforming lives through emotional mastery and science-backed resilience. Blending psychological precision with empathetic mentorship, she specializes in cognitive reframing, behavioral guidance, and inner grit. Her evidence-based approach dismantles anxiety, unlocks human potential, and equips individuals to navigate adversity with clarity and purpose.",
    educations: [
      { title: "M.A. Psychology", institution: null, start_year: null, end_year: null },
      { title: "M.Ed.", institution: null, start_year: null, end_year: null },
      { title: "B.Ed.", institution: null, start_year: null, end_year: null },
      { title: "B.Sc. Mathematics", institution: null, start_year: null, end_year: null },
      { title: "UGC-NET", institution: null, start_year: null, end_year: null },
    ],
    experiences: [
      { title: "Counselling Psychologist", organisation: "Mann-Tattva", location: null, start_year: null, end_year: null },
    ],
  },
  {
    ...base,
    id: 4,
    slug: "maithili-nargund",
    full_name: "Maithili Nargund",
    designation: "Counselling Psychologist",
    education: "M.Sc. Clinical & Counselling Psychology | REBT Certified (AEI affiliate)",
    registration_no: null,
    languages: ["English", "Kannada"],
    specializations: ["REBT", "Youth counselling", "Clinical assessment"],
    bio: "Maithili Nargund is an observant, growth-focused Counselling Psychologist grounded in clinical precision and empathetic client care. Holding an M.Sc. in Clinical and Counselling Psychology and certified in Rational Emotive Behaviour Therapy (REBT), she brings valuable clinical immersion from premier institutions like DIMHANS, AIISH, and Spandana Nursing Home. With a background spanning mental status evaluations, college lecturing, and youth empowerment facilitation, Maithili creates a structured yet deeply authentic therapeutic space—translating cognitive restructuring into practical, everyday resilience and personal growth.",
    educations: [
      { title: "M.Sc. Clinical & Counselling Psychology", institution: null, start_year: null, end_year: null },
      { title: "REBT Certified", institution: "AEI affiliate", start_year: null, end_year: null },
    ],
    experiences: [
      { title: "Clinical training", organisation: "DIMHANS", location: null, start_year: null, end_year: null },
      { title: "Clinical training", organisation: "AIISH", location: null, start_year: null, end_year: null },
      { title: "Clinical training", organisation: "Spandana Nursing Home", location: null, start_year: null, end_year: null },
    ],
  },
];

function author(slug: string) {
  const c = STATIC_COUNSELLORS.find((item) => item.slug === slug)!;
  return { slug: c.slug, full_name: c.full_name, is_verified: c.is_verified, photo_url: c.photo_url };
}

export const STATIC_EVENTS: PublicEvent[] = [
  {
    id: 1,
    slug: "kashay-four-emotions-workshop",
    title: "Kashay: reading the four emotions",
    body: "A half-day workshop on the Kashay-The Four Emotion Test. We will walk through how anger, attachment, pride, and deceit show up in everyday conflict, and practise a short regulation sequence you can use between sessions. Suitable for clients and students of counselling.",
    kind: "workshop",
    mode: "offline",
    location: "Mann-Tattva studio, Bengaluru",
    meeting_url: null,
    starts_at: "2026-12-06T04:30:00.000Z",
    ends_at: "2026-12-06T08:30:00.000Z",
    published_at: "2026-11-01T00:00:00.000Z",
    author: author("puja-jain"),
  },
  {
    id: 2,
    slug: "belief-change-evening",
    title: "An evening on belief change",
    body: "A live webinar on how clinical hypnosis and yogic attention work together when a belief keeps a pattern in place. Chinmai will demonstrate one short induction and leave time for questions. Cameras optional.",
    kind: "webinar",
    mode: "online",
    location: null,
    meeting_url: "https://meet.example.com/manntattva-belief-change",
    starts_at: "2026-12-13T13:30:00.000Z",
    ends_at: "2026-12-13T15:00:00.000Z",
    published_at: "2026-11-08T00:00:00.000Z",
    author: author("chinmai-hemanth"),
  },
  {
    id: 3,
    slug: "inner-grit-circle",
    title: "Inner grit circle",
    body: "A small hybrid gathering on anxiety, cognitive reframing, and the habits that hold a person steady through a hard month. Join in the room or on the live link. Limited to twenty people.",
    kind: "retreat",
    mode: "hybrid",
    location: "Jayanagar community hall, Bengaluru",
    meeting_url: "https://meet.example.com/manntattva-inner-grit",
    starts_at: "2027-01-10T04:00:00.000Z",
    ends_at: "2027-01-10T09:00:00.000Z",
    published_at: "2026-11-15T00:00:00.000Z",
    author: author("saundaryima-malviya"),
  },
  {
    id: 4,
    slug: "rebt-for-exam-season",
    title: "REBT for exam season",
    body: "A recorded-style teaching session for college students: spotting demanding beliefs, disputing them, and writing a next-day plan. Held in October for campus counsellors and student volunteers.",
    kind: "webinar",
    mode: "online",
    location: null,
    meeting_url: null,
    starts_at: "2026-10-18T08:30:00.000Z",
    ends_at: "2026-10-18T10:00:00.000Z",
    published_at: "2026-10-01T00:00:00.000Z",
    author: author("maithili-nargund"),
  },
];

export const STATIC_BLOGS: PublicBlog[] = [
  {
    id: 1,
    slug: "what-kashay-notices-first",
    title: "What Kashay notices before you do",
    excerpt: "Four emotions show up early in a fight. Naming which one arrived first changes what you do next.",
    body: "<p>Most arguments are already underway before anyone raises their voice. Kashay, the four-emotion frame, asks a smaller question: which feeling arrived first — anger, attachment, pride, or deceit?</p><p>Anger wants the other person to stop. Attachment wants them to stay. Pride wants to be right. Deceit wants the feeling not to be seen at all. Once you can tell those apart, regulation stops being a generic breathing exercise and becomes a choice that matches the emotion in the room.</p><p>Try it once this week. After a tense conversation, write one sentence that names the first emotion, not the story you told about it.</p>",
    cover_image_url: null,
    published_at: "2026-10-12T00:00:00.000Z",
    author: author("puja-jain"),
  },
  {
    id: 2,
    slug: "insight-needs-a-body",
    title: "Insight needs a body",
    excerpt: "Understanding a pattern is the start. Hypnosis and yogic attention are how the body learns the new one.",
    body: "<p>Clients often leave a session able to explain their pattern perfectly and still repeat it on Thursday. Explanation lives in language. The pattern lives in attention, breath, and the belief that fires before language does.</p><p>Clinical hypnosis and a short yogic pause are not decorations on top of therapy. They give the new belief a place to land. A published finding in positive psychology is only useful if the person can feel it once, in the room, before they try to live it.</p><p>If a concept will not survive ten quiet breaths, it is not ready to be homework.</p>",
    cover_image_url: null,
    published_at: "2026-09-28T00:00:00.000Z",
    author: author("chinmai-hemanth"),
  },
  {
    id: 3,
    slug: "reframing-without-arguing",
    title: "Reframing anxiety without arguing with it",
    excerpt: "Grit is not pushing harder. It is choosing a truer sentence and practising it until the body believes you.",
    body: "<p>Anxiety likes a debate. The more you insist you should not feel it, the more evidence it collects. Cognitive reframing works better as a correction than as a fight: one sentence that is accurate, specific, and small enough to use at 11pm.</p><p>Inner grit, in this sense, is repetition. You notice the catastrophic line, you write the accurate one, and you let behaviour follow the second sentence for a single next step — the email, the walk, the conversation you have been postponing.</p><p>Purpose returns when the next step is visible. Clarity is that step, named out loud.</p>",
    cover_image_url: null,
    published_at: "2026-09-04T00:00:00.000Z",
    author: author("saundaryima-malviya"),
  },
  {
    id: 4,
    slug: "one-rebt-question",
    title: "One REBT question for a hard afternoon",
    excerpt: "Before you restructure a whole week, ask whether the demand in the sentence is actually a preference.",
    body: "<p>Rational Emotive Behaviour Therapy starts with a blunt edit. “I must not fail this” becomes “I would strongly prefer not to fail this, and I can still act if I do.” The feeling does not vanish. The demand loosens.</p><p>On a hard afternoon, one question is enough: is this a fact, a preference, or a demand? Facts can be planned for. Preferences can be disappointed and survived. Demands are what turn a setback into a verdict on you.</p><p>Write the sentence down. Cross out “must”. Put the preference back in your own words. Then do the next ordinary thing the day still requires.</p>",
    cover_image_url: null,
    published_at: "2026-08-19T00:00:00.000Z",
    author: author("maithili-nargund"),
  },
];

export function staticCounsellors(filters: CounsellorFilters = {}, limit?: number) {
  const items = STATIC_COUNSELLORS.filter((c) => {
    if (filters.language && !c.languages.includes(filters.language)) return false;
    if (filters.specialization && !c.specializations.includes(filters.specialization)) return false;
    if (filters.mode === "online" && !c.offers_online) return false;
    if (filters.mode === "offline" && !c.offers_offline) return false;
    return true;
  });
  return limit ? items.slice(0, limit) : items;
}

export function staticCounsellor(slug: string) {
  return STATIC_COUNSELLORS.find((c) => c.slug === slug) ?? null;
}

export function staticEvents(scope: "upcoming" | "past") {
  const now = Date.now();
  return STATIC_EVENTS.filter((event) =>
    scope === "past" ? Date.parse(event.ends_at) < now : Date.parse(event.ends_at) >= now,
  );
}

export function staticEvent(slug: string) {
  return STATIC_EVENTS.find((event) => event.slug === slug) ?? null;
}

export function staticBlog(slug: string) {
  return STATIC_BLOGS.find((blog) => blog.slug === slug) ?? null;
}

export function staticFilterOptions() {
  const languages = [...new Set(STATIC_COUNSELLORS.flatMap((c) => c.languages))];
  const specializations = [...new Set(STATIC_COUNSELLORS.flatMap((c) => c.specializations))];
  return {
    languages: languages.map((name, id) => ({ id, name })),
    specializations: specializations.map((name, id) => ({ id, name })),
  };
}
