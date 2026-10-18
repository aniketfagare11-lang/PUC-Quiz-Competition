import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Spinner from '../components/Spinner';
import { api } from '../api/client';
import { useTeam } from '../context/TeamContext';

export default function TeamSelect() {
  const navigate = useNavigate();
  const { team } = useTeam();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.availability();
        if (!cancelled) setList(data.teams);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load teams');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Select Your Team</h1>
          <p className="mt-2 text-slate-400">Choose your assigned team number to begin.</p>
        </div>

        {team && (
          <div className="card mb-6 flex flex-col items-start justify-between gap-3 border-emerald-500/30 bg-emerald-500/5 p-4 sm:flex-row sm:items-center">
            <div className="text-sm text-emerald-100">
              You are already logged in as <span className="font-bold">Team {team.teamNumber}</span>.
            </div>
            <button onClick={() => navigate('/briefing')} className="btn-primary text-sm">
              Go to Briefing →
            </button>
          </div>
        )}

        {error && <div className="card mb-6 border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}

        {loading ? (
          <Spinner full label="Loading teams…" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {list.map((t) => {
              const isCurrent = team && team.teamNumber === t.teamNumber;
              return (
                <button
                  key={t.teamNumber}
                  onClick={() => 
                    t.registered && !isCurrent 
                      ? navigate(`/login?team=${t.teamNumber}`)
                      : navigate(`/register?team=${t.teamNumber}`)
                  }
                  disabled={false}
                  className={`group relative flex flex-col items-center gap-1 rounded-2xl border p-5 transition
                    ${isCurrent
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : t.registered
                      ? 'border-indigo-700/40 bg-indigo-900/20 hover:-translate-y-0.5 hover:border-indigo-500 hover:bg-indigo-900/40'
                      : 'border-slate-700 bg-slate-900/60 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-slate-800/60'}`}
                >
                  <span className="font-mono text-3xl font-bold text-white">
                    {String(t.teamNumber).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    {isCurrent ? 'Your team' : t.registered ? 'Login' : 'Register'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          A team number can be registered only once. If yours is taken, check with the proctor.
        </p>
      </div>
    </PageShell>
  );
}
