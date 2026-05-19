import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login, signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(username, email, password);
        toast.success('Welcome to TypeZone!');
      }
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to authenticate. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="glass-panel p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="grid grid-cols-3 gap-[3px] w-5 h-4">
                <span className="rounded-sm" style={{ background: 'color-mix(in srgb, var(--color-accent) 40%, transparent)' }} />
                <span className="rounded-sm" style={{ background: 'color-mix(in srgb, var(--color-accent) 40%, transparent)' }} />
                <span className="rounded-sm" style={{ background: 'var(--color-accent)' }} />
                <span className="rounded-sm" style={{ background: 'color-mix(in srgb, var(--color-accent) 40%, transparent)' }} />
                <span className="rounded-sm" style={{ background: 'color-mix(in srgb, var(--color-accent) 40%, transparent)' }} />
                <span className="rounded-sm" style={{ background: 'color-mix(in srgb, var(--color-accent) 40%, transparent)' }} />
              </div>
            </div>
            <p className="text-sm font-medium tracking-widest uppercase mb-1"
              style={{ color: 'var(--color-text-secondary)' }}>
              Welcome back
            </p>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {mode === 'login' ? 'Sign in to TypeZone' : 'Create your account'}
            </h1>
          </div>

          {/* Login / Signup toggle */}
          <div className="flex rounded-xl p-1 mb-6 gap-1"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={mode === m ? {
                  background: 'var(--color-accent)',
                  color: 'var(--color-background)',
                  boxShadow: '0 2px 8px color-mix(in srgb, var(--color-accent) 30%, transparent)'
                } : {
                  color: 'var(--color-text-secondary)'
                }}
              >
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Pick a username"
                  minLength={3}
                  required
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={8}
                required
                className="input-field"
              />
            </div>

            {error && (
              <div className="text-sm px-4 py-3 rounded-lg"
                style={{
                  background: 'color-mix(in srgb, var(--color-error) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-error) 40%, transparent)',
                  color: 'var(--color-error)'
                }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full gap-2 mt-2"
            >
              {busy ? (
                <span className="opacity-70">Working…</span>
              ) : mode === 'login' ? (
                <><LogIn size={18} /> Login</>
              ) : (
                <><UserPlus size={18} /> Create account</>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
            {mode === 'login' ? (
              <>New to TypeZone?{' '}
                <button type="button" onClick={() => setMode('signup')}
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: 'var(--color-accent)' }}>
                  Create an account
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')}
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: 'var(--color-accent)' }}>
                  Sign in
                </button>
              </>
            )}
          </p>

        </div>

        {/* Below card */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}>
          By continuing you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
