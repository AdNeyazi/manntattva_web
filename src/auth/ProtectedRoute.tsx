import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Role } from "../api";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Role[]; // if given, only these roles may open the page
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="center-note">Loading…</p>;
  const returnTo = `${location.pathname}${location.search}`;
  if (!user) return <Navigate to="/login" replace state={{ from: returnTo }} />;
  if (roles && !roles.includes(user.role)) {
    return <p className="center-note">You do not have access to this page.</p>;
  }
  return <>{children}</>;
}
