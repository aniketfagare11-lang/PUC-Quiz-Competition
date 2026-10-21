import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Spinner from '../components/Spinner';
import { api } from '../api/client';
import { useTeam } from '../context/TeamContext';

export default function RoundEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamParam = searchParams.get('team');
  const { loginTeam } = useTeam();

  const [teams, setTeams] = useState([]);
  const [teamNumber, setTeamNumber] = useState(teamParam || '');
  const [collegeName, setCollegeName] = useState(() => {
    try {
      return localStorage.getItem('qc_college_name') || '';
    } catch {
      return '';
    }
  });
  const [participant1, setParticipant1] = useState('');
  const [participant2, setParticipant2] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.availability()
      .then((data) => {
        const available = (data.teams || []).filter((team) => team.available);
        setTeams(available);
        if (!teamParam && available.length > 0) {
          setTeamNumber(String(available[0].teamNumber));
        }
      })
      .catch((err) => setError(err.message || 'Could not load available teams'))
      .finally(() => setLoading(false));
  }, [teamParam]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const college = collegeName.trim();
    const p1 = participant1.trim();
    const p2 = participant2.trim();

    if (!college) {
      setError('Please enter your college name');
      return;
    }
    if (!p1 || !p2) {
      setError('Please enter both participant names');
      return;
    }
    if (p1.toLowerCase() === p2.toLowerCase()) {
      setError('Participant names must be different');
      return;
    }

    setSubmitting(true);

    // Save college name locally for display/reference across the app
    try {
      localStorage.setItem('qc_college_name', college);
    } catch {
      // Ignore storage errors
    }

try {
  const response = await api.register({
    collegeName: collegeName.trim(),
    member1Name: p1.trim(),
    member2Name: p2.trim(),
  });

  loginTeam(response.team, response.token);
  navigate('/briefing', { replace: true });
} catch (err) {
  setError(err.message || 'Registration failed. Please try again.');
} finally {
  setSubmitting(false);
}

  };
  if (loading) return <Spinner full label="Loading registration…" />;

  return (
    <PageShell>
      <div className="relative mx-auto max-w-lg py-4 sm:py-8">
        {/* Subtle orange ambient glow */}
        <div
          className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[420px] max-w-[90vw] h-[220px] bg-[#FDBA74]/[0.045] rounded-full blur-[80px] -z-10"
          aria-hidden="true"
        />

        {/* Page Heading Section */}
        <div className="animate-hero-reveal mb-8 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#FDBA74]">
            AVISHKAR 5.0
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Quiz Registration
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-[#A3A3A3] leading-relaxed max-w-md mx-auto">
            Welcome, PUC students! Fill in your college and both participant names to register for the quiz.
          </p>
        </div>

        {/* Registration Form Card */}
        <form
          onSubmit={submit}
          className="animate-card-reveal card rounded-2xl border border-[#333333] bg-[#171717] p-6 sm:p-8 shadow-2xl shadow-black/60 grid gap-5"
        >
          {error && (
            <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 p-3.5 text-sm text-rose-200 flex items-start gap-2.5">
              <svg className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Field 1: College Name */}
          <div>
            <label className="label">College Name</label>
            <input
              className="input"
              type="text"
              placeholder="Enter your college name"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              maxLength={100}
              required
              autoFocus
            />
          </div>

          {/* Field 2: Participant 1 Name */}
          <div>
            <label className="label">Participant 1 Name</label>
            <input
              className="input"
              type="text"
              placeholder="Enter first participant's full name"
              value={participant1}
              onChange={(e) => setParticipant1(e.target.value)}
              maxLength={60}
              required
            />
          </div>

          {/* Field 3: Participant 2 Name */}
          <div>
            <label className="label">Participant 2 Name</label>
            <input
              className="input"
              type="text"
              placeholder="Enter second participant's full name"
              value={participant2}
              onChange={(e) => setParticipant2(e.target.value)}
              maxLength={60}
              required
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn-primary mt-2 w-full py-3.5 text-base font-bold shadow-md shadow-[#FDBA74]/15 hover:shadow-[0_0_24px_rgba(253,186,116,0.3)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Verifying…' : 'Get Started →'}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
