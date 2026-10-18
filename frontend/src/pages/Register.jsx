import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { api } from '../api/client';
import { useTeam } from '../context/TeamContext';

export default function Register() {
  const navigate = useNavigate();
  const { team, loginTeam } = useTeam();
  const [params] = useSearchParams();

  const teamNumber = Number(params.get('team')) || (team ? team.teamNumber : null);

  const [member1Name, setMember1Name] = useState('');
  const [member2Name, setMember2Name] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in as a team, send them to the briefing
  useEffect(() => {
    if (team) navigate('/briefing', { replace: true });
  }, [team, navigate]);

  if (!teamNumber) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold text-white">No team selected</h1>
          <p className="mt-2 text-slate-400">Please pick your team number first.</p>
          <Link to="/team" className="btn-primary mt-6">Choose a team</Link>
        </div>
      </PageShell>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.register({ teamNumber, member1Name, member2Name });
      loginTeam(res.team, res.token);
      navigate('/briefing', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-lg">
        <Link to="/team" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
          ← Back to teams
        </Link>

        <div className="card p-7">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-500/10 font-mono text-2xl font-bold text-indigo-300">
              {String(teamNumber).padStart(2, '0')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Register Team {teamNumber}</h1>
              <p className="text-sm text-slate-400">Enter both team members to continue.</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="grid gap-5">
            <div>
              <label className="label">1st-semester member name</label>
              <input
                className="input"
                placeholder="e.g. Ananya Sharma"
                value={member1Name}
                maxLength={60}
                onChange={(e) => setMember1Name(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">3rd-semester member name</label>
              <input
                className="input"
                placeholder="e.g. Rohan Verma"
                value={member2Name}
                maxLength={60}
                onChange={(e) => setMember2Name(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary mt-1">
              {submitting ? 'Registering…' : 'Register & Continue'}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
