import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminLayout from "./admin/AdminLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Counsellors from "./pages/Counsellors";
import CounsellorProfile from "./pages/CounsellorProfile";
import Booking from "./pages/Booking";
import MyProfile from "./pages/MyProfile";
import AdminCounsellors from "./pages/AdminCounsellors";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLookups from "./pages/admin/AdminLookups";
import AdminSettings from "./pages/admin/AdminSettings";

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
        <Route
          path="/booking"
          element={<ProtectedRoute><Booking /></ProtectedRoute>}
        />
        <Route path="/counsellors/:slug" element={<CounsellorProfile />} />
        <Route
          path="/counsellors/:slug/book"
          element={<ProtectedRoute><Booking /></ProtectedRoute>}
        />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/my/profile" element={<ProtectedRoute roles={["counsellor"]}><MyProfile /></ProtectedRoute>} />
        <Route
          path="/admin"
          element={<ProtectedRoute roles={["admin"]}><AdminLayout /></ProtectedRoute>}
        >
          <Route index element={<AdminOverview />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="counsellors" element={<AdminCounsellors />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="lookups" element={<AdminLookups />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<p className="center-note">Page not found.</p>} />
      </Routes>
      <SiteFooter />
    </>
  );
}
