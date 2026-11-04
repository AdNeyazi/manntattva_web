import { useLocation } from "react-router-dom";
import Footer from "./Footer";

/** Footer on all pages except admin console and role dashboards. */
export default function SiteFooter() {
  const { pathname } = useLocation();

  const hide =
    pathname === "/dashboard" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (hide) return null;
  return <Footer />;
}
