import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { api } from '../api/client';
import { useAdmin } from '../context/AdminContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { admin, loginAdmin } = useAdmin();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (admin) navigate('/admin', { replace: true });
  }, [admin, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.adminLogin({ username, password });
      loginAdmin({ username: res.username }, res.token);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-sm">
        <div className="card p-7">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-indigo-300">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-sm text-slate-400">Proctor & organiser access only.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="grid gap-4">
            <div>
              <label className="label">Username</label>
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary mt-1">
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <div className="mt-4 text-center text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-300">← Back to home</Link>
        </div>
      </div>
    </PageShell>
  );
}
