import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(username, email, password);
      }
      navigate('/');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to authenticate. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section login-page">
      <div className="login-panel glass-panel">
        <div className="login-header">
          <div className="brand-mark">
            <div className="keyboard-logo">
              <span className="key-block" />
              <span className="key-block" />
              <span className="key-block accent" />
            </div>
          </div>
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>{mode === 'login' ? 'Sign in to TypeZone' : 'Create your account'}</h1>
          </div>
        </div>

        <div className="login-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'toggle-button active' : 'toggle-button'}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'toggle-button active' : 'toggle-button'}
            onClick={() => setMode('signup')}
          >
            Signup
          </button>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          {mode === 'signup' && (
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Type a username"
                minLength={3}
                required
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              minLength={8}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={busy}>
            {busy ? (
              'Working…'
            ) : mode === 'login' ? (
              <>
                <LogIn size={18} />
                Login
              </>
            ) : (
              <>
                <LogIn size={18} />
                Create account
              </>
            )}
          </button>
        </form>

        <p className="login-note">
          {mode === 'login'
            ? 'New to TypeZone? Create an account to save progress.'
            : 'Already have an account? Login to continue.'}
        </p>
      </div>
    </section>
  );
}
