import type { ReactNode } from "react";
import { Mandala, Stars, Lotus } from "../components/Decor";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="auth-page">
      <Stars />
      <Mandala className="auth-mandala" />

      <div className="auth-stack">
        <div className="auth-card">
          <span className="auth-mark"><Lotus size={34} /></span>
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
        </div>

        <div className="breathe" aria-hidden="true">
          <span className="breathe-orb" />
          <span className="breathe-text">
            <span className="in">Breathe in…</span>
            <span className="out">and out</span>
          </span>
        </div>
      </div>
    </div>
  );
}
