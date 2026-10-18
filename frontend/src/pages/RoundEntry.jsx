import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Spinner from '../components/Spinner';
import { api } from '../api/client';
import { useTeam } from '../context/TeamContext';

export default function RoundEntry({ round }) {
  const navigate = useNavigate();
  const { loginTeam } = useTeam();
  const [teams, setTeams] = useState([]);
  const [teamNumber, setTeamNumber] = useState('');
  const [participant1, setParticipant1] = useState('');
  const [participant2, setParticipant2] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.availability()
      .then((data) => setTeams(data.teams.filter((team) => team.available)))
      .catch((err) => setError(err.message || 'Could not load teams'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    // Fullscreen requests must originate from a direct user gesture.
    try {
      if (document.documentElement?.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Ignore unsupported/rejected fullscreen requests and continue the quiz flow.
    }
    try {
      const response = await api.startSession({
        teamNumber: Number(teamNumber),
        participants: [participant1, participant2],
        round,
      });
      loginTeam(response.team, response.token);
      navigate(`/round${round}/quiz`, { replace: true });
    } catch (err) {
      setError(err.message || 'Could not verify this team');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner full label="Loading teams…" />;

  return (
    <PageShell>
      <div className="mx-auto max-w-lg">
        <div className="mb-7 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">AI Quiz Time</div>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Round {round}</h1>
          <p className="mt-2 text-slate-400">
            {round === 1 ? 'Select your predefined team and enter both participant names.' : 'Verify the same participant names used in Round 1.'}
          </p>
        </div>
        <form onSubmit={submit} className="card grid gap-5 p-7">
          {error && <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}
          <div>
            <label className="label">Team number</label>
            <select className="input" value={teamNumber} onChange={(e) => setTeamNumber(e.target.value)} required>
              <option value="">Select your team</option>
              {teams.map((team) => <option key={team.teamNumber} value={team.teamNumber}>Team {String(team.teamNumber).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Participant 1</label>
            <input className="input" value={participant1} onChange={(e) => setParticipant1(e.target.value)} maxLength={60} required autoFocus />
          </div>
          <div>
            <label className="label">Participant 2</label>
            <input className="input" value={participant2} onChange={(e) => setParticipant2(e.target.value)} maxLength={60} required />
          </div>
          <button type="submit" className="btn-primary mt-1" disabled={submitting}>
            {submitting ? 'Verifying…' : round === 1 ? 'Get Started' : 'Verify & Get Started'}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
