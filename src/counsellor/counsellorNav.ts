export type CounsellorNavItem = {
  to: string;
  label: string;
  end?: boolean;
  description?: string;
};

export const COUNSELLOR_NAV: CounsellorNavItem[] = [
  { to: "/my", label: "Overview", end: true, description: "Sessions and publishing status" },
  { to: "/my/profile", label: "Profile", description: "Public bio, photo, and availability" },
  { to: "/my/blogs", label: "Blogs", description: "Write posts for admin approval" },
  { to: "/my/events", label: "Events", description: "Workshops, webinars, and retreats" },
];
