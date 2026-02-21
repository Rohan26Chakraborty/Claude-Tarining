import { useState } from 'react';
import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import ActivityLog from './components/ActivityLog';
import LoginForm from './components/LoginForm';

export default function App() {
  // Lazy init — reads localStorage once on mount, no useEffect needed
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('auth_token')
  );

  function handleLogin(newToken: string) {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem('auth_token');
    setToken(null);
  }

  if (!token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 text-gray-800 font-sans">

      {/* Dot-grid SVG pattern layer */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%23a5b4fc'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Radial glow — top-left */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-600/30 blur-3xl pointer-events-none" />

      {/* Radial glow — bottom-right */}
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-600/25 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100/50 p-8 sm:p-10">
          <div className="mb-8 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
                Tasks
              </h1>
              <p className="text-center text-gray-500 text-sm">Organize your day, one task at a time</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-500 transition mt-1 ml-4 shrink-0"
            >
              Sign out
            </button>
          </div>
          <AddTodo />
          <TodoList />
          <ActivityLog />
        </div>
      </div>
    </div>
  );
}

