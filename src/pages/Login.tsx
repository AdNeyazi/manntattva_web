import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { errorMessages } from "../api";
import { useAuth } from "../auth/AuthContext";
import AuthShell from "./AuthShell";

interface LocationState {
  from?: string;
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setBusy(true);
    try {
      await login(form.email, form.password);
      const from = (location.state as LocationState | null)?.from;
      navigate(from || "/dashboard", { replace: true });
    } catch (err) {
      setErrors(errorMessages(err, "Could not log in"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Return to your calm. Log in to continue your journey.">
      <form onSubmit={onSubmit} className="form">
        {errors.length > 0 && (
          <div className="form-error" role="alert">{errors.map((m) => <div key={m}>{m}</div>)}</div>
        )}
        <label>Email
          <input type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
        </label>
        <label>Password
          <input type="password" required autoComplete="current-password" value={form.password} onChange={set("password")} />
        </label>
        <button className="btn btn-indigo btn-block" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
        <p className="form-foot">New here? <Link to="/signup">Create an account</Link></p>
      </form>
    </AuthShell>
  );
}
