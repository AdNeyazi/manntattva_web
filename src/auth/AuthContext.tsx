import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore, type SignupFields, type User } from "../api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fields: SignupFields) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Only "loading" if there is a saved token to verify.
  const [loading, setLoading] = useState<boolean>(() => Boolean(tokenStore.get()));

  // On first load: if a token is saved, ask the server who we are.
  useEffect(() => {
    if (!tokenStore.get()) return;
    api
      .me()
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.clear()) // expired or revoked token
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const d = await api.login(email, password);
    setUser(d.user);
  }, []);

  const signup = useCallback(async (fields: SignupFields) => {
    const d = await api.signup(fields);
    setUser(d.user);
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } catch { /* clear locally even if the server is unreachable */ }
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
