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
import Verify from "./pages/Verify";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CounsellorLayout from "./counsellor/CounsellorLayout";
import MyOverview from "./pages/my/MyOverview";
import MyBlogs from "./pages/my/MyBlogs";
import MyBlogForm from "./pages/my/MyBlogForm";
import MyEvents from "./pages/my/MyEvents";
import MyEventForm from "./pages/my/MyEventForm";
import AdminCounsellors from "./pages/AdminCounsellors";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLookups from "./pages/admin/AdminLookups";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminModeration from "./pages/admin/AdminModeration";

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
        <Route path="/verify" element={<Verify />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:slug" element={<BlogDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:slug" element={<EventDetail />} />
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
        <Route
          path="/my"
          element={<ProtectedRoute roles={["counsellor"]}><CounsellorLayout /></ProtectedRoute>}
        >
          <Route index element={<MyOverview />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="blogs" element={<MyBlogs />} />
          <Route path="blogs/new" element={<MyBlogForm />} />
          <Route path="blogs/:id" element={<MyBlogForm />} />
          <Route path="events" element={<MyEvents />} />
          <Route path="events/new" element={<MyEventForm />} />
          <Route path="events/:id" element={<MyEventForm />} />
        </Route>
        <Route
          path="/admin"
          element={<ProtectedRoute roles={["admin"]}><AdminLayout /></ProtectedRoute>}
        >
          <Route index element={<AdminOverview />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="counsellors" element={<AdminCounsellors />} />
          <Route path="blogs" element={<AdminModeration kind="blogs" />} />
          <Route path="events" element={<AdminModeration kind="events" />} />
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
