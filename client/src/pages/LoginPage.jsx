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
    <main className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%2338bdf8\" fill-opacity=\"0.03\"><path d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/></g></g></svg>')] opacity-40"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-2xl transform transition-transform hover:scale-110">
            <span className="text-4xl font-bold text-white">T</span>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">TypeZone</h1>
          <p className="text-lg text-slate-400 font-light">Professional typing analytics platform</p>
        </div>

        {/* Main Card */}
        <section className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl">
          {/* Mode Toggle */}

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-800/50 p-1 mb-6">
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setMode('signup')}
            >
              Signup
            </button>
          </div>

          {/* Form */}
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
