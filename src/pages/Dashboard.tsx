import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null; // ProtectedRoute already guards this page; this keeps TypeScript happy

  return (
    <section className="dashboard container">
      <div className="card dash-card">
        <span className="pill">{user.role.replace("_", " ")}</span>
        <h1>Hello, {user.full_name}</h1>
        <p className="dash-sub">Signed in as <b>{user.email}</b></p>
        <p>Bookings, courses and events will appear here in the next phases.</p>
      </div>
    </section>
  );
}
