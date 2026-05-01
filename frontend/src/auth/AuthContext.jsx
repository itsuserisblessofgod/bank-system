import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'ebms.auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const value = useMemo(
    () => ({
      auth,
      login: (data, remember = true) => {
        const nextAuth = { ...data, remember };
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
        (remember ? sessionStorage : localStorage).removeItem(STORAGE_KEY);
        setAuth(nextAuth);
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        setAuth(null);
      },
      isAdmin: auth?.role === 'ROLE_ADMIN',
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
