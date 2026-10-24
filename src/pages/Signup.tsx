import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errorMessages, type SignupFields } from "../api";
import { useAuth } from "../auth/AuthContext";
import AuthShell from "./AuthShell";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<SignupFields>({
    full_name: "",
    email: "",
    country_code: "+91",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof SignupFields) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    if (form.password !== form.password_confirmation) {
      setErrors(["Passwords do not match"]);
      return;
    }
    setBusy(true);
    try {
      await signup(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors(errorMessages(err, "Could not sign up"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Begin your journey" subtitle="Create a free account. Book a counsellor whenever you are ready.">
      <form onSubmit={onSubmit} className="form">
        {errors.length > 0 && (
          <div className="form-error" role="alert">{errors.map((m) => <div key={m}>{m}</div>)}</div>
        )}
        <label>Full name
          <input required autoComplete="name" value={form.full_name} onChange={set("full_name")} />
        </label>
        <label>Email
          <input type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
        </label>
        <div className="row">
          <label>Code
            <input autoComplete="tel-country-code" value={form.country_code} onChange={set("country_code")} />
          </label>
          <label>Phone
            <input type="tel" autoComplete="tel-national" value={form.phone} onChange={set("phone")} />
          </label>
        </div>
        <label>Password (min 6 characters)
          <input type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={set("password")} />
        </label>
        <label>Confirm password
          <input type="password" required autoComplete="new-password" value={form.password_confirmation} onChange={set("password_confirmation")} />
        </label>
        <button className="btn btn-indigo btn-block" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
        <p className="form-foot">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </AuthShell>
  );
}
