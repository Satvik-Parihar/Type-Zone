import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../utils/api';

const AUTH_STORAGE_KEY = 'typezone_auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (!cancelled) {
            setUser(parsed.user || null);
          }
        } catch (error) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }

      try {
        const { data } = await api.post('/auth/refresh');
        if (cancelled) return;

        setToken(data.accessToken);
        setAuthToken(data.accessToken);

        const profile = await api.get('/user/profile', {
          headers: {
            Authorization: `Bearer ${data.accessToken}`
          }
        });

        if (!cancelled) {
          setUser(profile.data.user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: profile.data.user }));
        }
      } catch (error) {
        if (!cancelled) {
          setToken('');
          setUser(null);
          setAuthToken('');
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      async login(email, password) {
        const { data } = await api.post('/auth/login', { email, password });
        setToken(data.accessToken);
        setUser(data.user);
        setAuthToken(data.accessToken);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: data.user }));
      },
      async signup(username, email, password) {
        const { data } = await api.post('/auth/register', { username, email, password });
        setToken(data.accessToken);
        setUser(data.user);
        setAuthToken(data.accessToken);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: data.user }));
      },
      async logout() {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          // Ignore logout failures and clear local auth state anyway.
        }
        setToken('');
        setUser(null);
        setAuthToken('');
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
