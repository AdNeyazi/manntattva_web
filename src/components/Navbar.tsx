import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./Navbar.css";

const DARK_OVERLAY = ["/login", "/signup"];

const MAIN_LINKS = [
  { to: "/#about", label: "About", match: null },
  { to: "/#services", label: "Services", match: null },
  { to: "/counsellors", label: "Counsellors", match: "/counsellors" },
  { to: "/#how", label: "How it works", match: null },
] as const;

function isBandRoute(pathname: string): boolean {
  if (pathname === "/counsellors" || pathname === "/booking" || pathname === "/dashboard") return true;
  if (pathname.startsWith("/counsellors/")) return true;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  if (pathname === "/my/profile") return true;
  return false;
}

function linkActive(pathname: string, match: string | null): boolean {
  if (!match) return false;
  if (match === "/counsellors") {
    return pathname === "/counsellors" || pathname.startsWith("/counsellors/");
  }
  return pathname === match || pathname.startsWith(`${match}/`);
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const dark = DARK_OVERLAY.includes(pathname);
  const home = pathname === "/";
  const band = !dark && !home && isBandRoute(pathname);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const navClass = ["nav", home ? "nav--home" : "", dark ? "nav--dark" : "", band ? "nav--band" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={navClass}>
      <div className="nav-inner">
        <Link className="logo" to="/" onClick={() => setMenuOpen(false)}>
          <img className="logo-image" src="/MANNTATTVA.png" alt="Manntattva" />
        </Link>

        <nav className="nav-links" aria-label="Main">
          {MAIN_LINKS.map(({ to, label, match }) => (
            <Link
              key={to}
              to={to}
              className={linkActive(pathname, match) ? "nav-link--active" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="btn btn-sm btn-gold nav-book" to="/booking?segment=heartbreak">
            Book session
          </Link>
          {user ? (
            <>
              {user.role === "counsellor" && (
                <Link className="link-quiet" to="/my/profile">My profile</Link>
              )}
              {user.role === "admin" && (
                <Link className="link-quiet" to="/admin">Admin console</Link>
              )}
              <button type="button" className="btn btn-sm btn-line" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link className="link-quiet" to="/login">Log in</Link>
          )}

          <button
            type="button"
            className="nav-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="nav-drawer"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div id="nav-drawer" className={`nav-drawer${menuOpen ? " nav-drawer--open" : ""}`}>
        <div className="nav-drawer-inner">
          {MAIN_LINKS.map(({ to, label, match }) => (
            <Link
              key={to}
              to={to}
              className={linkActive(pathname, match) ? "nav-link--active" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link to="/booking?segment=heartbreak" onClick={() => setMenuOpen(false)}>
            Book session
          </Link>
          {!user && (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
          )}
          {user && (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {user.role === "counsellor" && (
                <Link to="/my/profile" onClick={() => setMenuOpen(false)}>My profile</Link>
              )}
              {user.role === "admin" && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin console</Link>
              )}
              <button
                type="button"
                className="nav-drawer-logout"
                onClick={() => {
                  setMenuOpen(false);
                  void handleLogout();
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
