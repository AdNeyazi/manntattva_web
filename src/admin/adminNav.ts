export type AdminNavItem = {
  to: string;
  label: string;
  end?: boolean;
  description?: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin", label: "Overview", end: true, description: "Summary and quick actions" },
  { to: "/admin/analytics", label: "Analytics", description: "Bookings, users, and trends" },
  { to: "/admin/counsellors", label: "Counsellors", description: "Create accounts and publish profiles" },
  { to: "/admin/appointments", label: "Appointments", description: "All sessions across the platform" },
  { to: "/admin/users", label: "Users", description: "Clients, counsellors, and admins" },
  { to: "/admin/lookups", label: "Lookups", description: "Languages and specializations" },
  { to: "/admin/settings", label: "Settings", description: "Platform configuration" },
];
