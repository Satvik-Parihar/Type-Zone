import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, signup } = useAuth();
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
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Request failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-semibold text-slate-100">TypeZone</h1>
        <p className="mt-1 text-sm text-slate-400">Professional typing analytics platform</p>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-800 p-1">
          <button type="button" className={`rounded-md px-3 py-2 text-sm ${mode === 'login' ? 'bg-sky-500 text-white' : 'text-slate-300'}`} onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className={`rounded-md px-3 py-2 text-sm ${mode === 'signup' ? 'bg-sky-500 text-white' : 'text-slate-300'}`} onClick={() => setMode('signup')}>
            Signup
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {mode === 'signup' && (
            <label className="block text-sm text-slate-300">
              Username
              <input
                className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-sky-500"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                minLength={3}
                maxLength={40}
                required
              />
            </label>
          )}

          <label className="block text-sm text-slate-300">
            Email
            <input
              className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-sky-500"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block text-sm text-slate-300">
            Password
            <input
              className="mt-1 w-full rounded-md bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-sky-500"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button type="submit" disabled={busy} className="w-full rounded-md bg-sky-500 px-4 py-2 font-medium text-white hover:bg-sky-400 disabled:opacity-60">
            {busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </section>
    </main>
  );
}
