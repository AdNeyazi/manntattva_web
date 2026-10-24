import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const DARK_PAGES = ["/", "/login", "/signup"];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dark = DARK_PAGES.includes(pathname);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className={`nav ${dark ? "nav--dark" : ""}`}>
      <div className="nav-inner">
        <Link className="logo" to="/">
          <img className="logo-image" src="/MANNTATTVA.png" alt="Manntattva" />
        </Link>

        <nav className="nav-links" aria-label="Main">
          <Link to="/#about">About</Link>
          <Link to="/#services">Services</Link>
          <Link to="/#counsellors">Counsellors</Link>
          <Link to="/#how">How it works</Link>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <Link className="link-quiet" to="/dashboard">Hi, {user.full_name.split(" ")[0]}</Link>
              <button className="btn btn-sm btn-line" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="link-quiet" to="/login">Log in</Link>
              <Link className="btn btn-sm btn-gold" to="/signup">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
