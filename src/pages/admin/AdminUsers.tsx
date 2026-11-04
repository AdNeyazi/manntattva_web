import { useEffect, useMemo, useState } from "react";
import { api, errorMessages, type AdminUserRow, type Role } from "../../api";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.admin.users
      .list()
      .then((d) => setUsers(d.users))
      .catch((err) => setError(errorMessages(err, "Could not load users")[0]));
  }, []);

  const filtered = useMemo(() => {
    if (!users) return null;
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return `${u.full_name} ${u.email}`.toLowerCase().includes(q);
    });
  }, [users, roleFilter, query]);

  return (
    <>
      <header className="admin-page-head">
        <span className="eyebrow eyebrow--light">Admin</span>
        <h1>Users</h1>
        <p>Clients, counsellors, and administrators registered on the platform.</p>
      </header>

      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="admin-panel">
        <div className="admin-grid" style={{ gridTemplateColumns: "1fr 180px" }}>
          <label>
            Search
            <input
              type="search"
              placeholder="Name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="filter-field">
            <span>Role</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
            >
              <option value="all">All roles</option>
              <option value="end_user">Clients</option>
              <option value="counsellor">Counsellors</option>
              <option value="admin">Admins</option>
            </select>
          </label>
        </div>
      </div>

      {filtered === null && !error && <p className="muted-center">Loading users…</p>}

      {filtered && (
        <div className="admin-panel table-wrap" style={{ padding: "12px 16px" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.full_name}</b></td>
                  <td>{u.email}</td>
                  <td><span className="dash-tag">{u.role.replace("_", " ")}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="admin-soon" style={{ marginTop: 16 }}>No users match.</p>}
        </div>
      )}
    </>
  );
}
