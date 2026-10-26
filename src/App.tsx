import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./auth/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Counsellors from "./pages/Counsellors";
import CounsellorProfile from "./pages/CounsellorProfile";
import MyProfile from "./pages/MyProfile";
import AdminCounsellors from "./pages/AdminCounsellors";

// React Router does not scroll to #anchors by itself, so links like "/#services" need this.
function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToHash />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/counsellors" element={<Counsellors />} />
        <Route path="/counsellors/:slug" element={<CounsellorProfile />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/my/profile" element={<ProtectedRoute roles={["counsellor"]}><MyProfile /></ProtectedRoute>} />
        <Route path="/admin/counsellors" element={<ProtectedRoute roles={["admin"]}><AdminCounsellors /></ProtectedRoute>} />
        <Route path="*" element={<p className="center-note">Page not found.</p>} />
      </Routes>
    </>
  );
}
