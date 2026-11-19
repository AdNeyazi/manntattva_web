import { NavLink, Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { COUNSELLOR_NAV } from "./counsellorNav";
import "../admin/AdminLayout.css";
import "../pages/Dashboard.css";

export default function CounsellorLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-side" aria-label="Counsellor dashboard">
        <div className="admin-side-head">
          <b>Dashboard</b>
          <span>Profile, blogs, and events</span>
        </div>
        <nav className="admin-side-nav">
          {COUNSELLOR_NAV.map(({ to, label, end, description }) => (
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
          <Link to="/dashboard">My account</Link>
          <Link to="/counsellors">View public listing</Link>
          <Link to="/">View public site</Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
