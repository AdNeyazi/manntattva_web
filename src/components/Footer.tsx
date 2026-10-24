import { Link } from "react-router-dom";
import { Lotus } from "./Decor";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link className="logo" to="/">
            <Lotus size={26} />
            <span>Manntattva</span>
          </Link>
          <p className="footer-about">
            A philanthropic initiative of the Sipani Group of Companies, bringing psychological
            clarity and compassionate healing into everyday lives.
          </p>
        </div>

        <div>
          <h4>Explore</h4>
          <Link to="/#about">About</Link>
          <Link to="/#services">Services</Link>
          <Link to="/#counsellors">Counsellors</Link>
          <Link to="/signup">Create account</Link>
        </div>

        <div>
          <h4>In a crisis?</h4>
          <p className="footer-about">
            Manntattva is not an emergency service. If you may be in danger, call your local
            emergency number or the Tele-MANAS helpline (India): <b>14416</b>.
          </p>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} Manntattva. All rights reserved.</p>
    </footer>
  );
}
