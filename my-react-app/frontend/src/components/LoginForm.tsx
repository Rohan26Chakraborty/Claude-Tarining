import { useState } from 'react';
import { forgotPassword, resetPassword } from '../api/todos';

interface Props {
  onLogin: (token: string) => void;
}

type View = 'login' | 'register' | 'forgot' | 'reset';

export default function LoginForm({ onLogin }: Props) {
  const [view, setView] = useState<View>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [displayedToken, setDisplayedToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function switchView(next: View) {
    setView(next);
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setResetToken('');
    setNewPassword('');
    setDisplayedToken('');
  }

  async function handleLoginRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = view === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = view === 'login' ? { email, password } : { name, email, password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (view === 'login' ? 'Login failed' : 'Registration failed'));
        return;
      }
      onLogin(data.token);
    } catch {
      setError('Network error — is the server running?');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      if (data.resetToken) {
        setDisplayedToken(data.resetToken);
        setSuccess('Reset token generated. Copy it and use it to reset your password.');
      } else {
        setSuccess('If that email is registered, a reset token would be sent.');
      }
    } catch {
      setError('Network error — is the server running?');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      setSuccess('Password reset successfully! You can now sign in.');
      setTimeout(() => switchView('login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  const bg = (
    <>
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%23a5b4fc'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-600/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-600/25 blur-3xl pointer-events-none" />
    </>
  );

  // ── Forgot Password view ──
  if (view === 'forgot') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 flex items-center justify-center px-4">
        {bg}
        <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 p-8 sm:p-10">
          <button onClick={() => switchView('login')} className="text-sm text-indigo-500 hover:text-indigo-700 mb-4 flex items-center gap-1 transition">
            ← Back to sign in
          </button>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
            Forgot Password
          </h1>
          <p className="text-center text-gray-500 text-sm mb-8">Enter your email to get a reset token</p>

          {error && <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
          {success && <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">{success}</div>}

          {displayedToken && (
            <div className="mb-5 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
              <p className="text-xs text-indigo-500 mb-1 font-medium">Your reset token (copy this):</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-indigo-800 break-all flex-1">{displayedToken}</code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(displayedToken)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold shrink-0 transition"
                >
                  Copy
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setResetToken(displayedToken); switchView('reset'); }}
                className="mt-3 w-full py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 transition"
              >
                Reset my password →
              </button>
            </div>
          )}

          {!displayedToken && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white/70 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending…' : 'Get reset token'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── Reset Password view ──
  if (view === 'reset') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 flex items-center justify-center px-4">
        {bg}
        <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 p-8 sm:p-10">
          <button onClick={() => switchView('forgot')} className="text-sm text-indigo-500 hover:text-indigo-700 mb-4 flex items-center gap-1 transition">
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p className="text-center text-gray-500 text-sm mb-8">Enter your reset token and new password</p>

          {error && <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
          {success && <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">{success}</div>}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reset Token</label>
              <input
                type="text"
                value={resetToken}
                onChange={e => setResetToken(e.target.value)}
                placeholder="Paste your reset token"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white/70 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-indigo-100 bg-white/70 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition text-xs select-none"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Login / Register view ──
  const isLogin = view === 'login';
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 flex items-center justify-center px-4">
      {bg}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          {isLogin ? 'Sign in to your account' : 'Start managing your tasks'}
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginRegister} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white/70 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white/70 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => switchView('forgot')}
                  className="text-xs text-indigo-500 hover:text-indigo-700 transition"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 pr-11 rounded-xl border border-indigo-100 bg-white/70 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition text-xs select-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button
            type="button"
            onClick={() => switchView(isLogin ? 'register' : 'login')}
            className="text-indigo-600 font-semibold hover:text-indigo-700 transition"
          >
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
