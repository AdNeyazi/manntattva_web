import { NavLink, Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { ADMIN_NAV } from "./adminNav";
import "./AdminLayout.css";
import "../pages/Dashboard.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-side" aria-label="Admin navigation">
        <div className="admin-side-head">
          <b>Admin console</b>
          <span>Manage Manntattva</span>
        </div>
        <nav className="admin-side-nav">
          {ADMIN_NAV.map(({ to, label, end, description }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-side-link${isActive ? " admin-side-link--active" : ""}`
              }
            >
              {label}
              {description && <small>{description}</small>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <Link to="/dashboard">← Main dashboard</Link>
          <Link to="/">View public site</Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
