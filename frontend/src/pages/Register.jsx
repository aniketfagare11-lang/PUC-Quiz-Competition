import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { api } from '../api/client';
import { useTeam } from '../context/TeamContext';

export default function Register() {
  const navigate = useNavigate();
  const { team, loginTeam } = useTeam();
  const [collegeName, setCollegeName] = useState('');
  const [member1Name, setMember1Name] = useState('');
  const [member2Name, setMember2Name] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (team) navigate('/briefing', { replace: true });
  }, [team, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const college = collegeName.trim();
    const participant1 = member1Name.trim();
    const participant2 = member2Name.trim();
    if (!college || !participant1 || !participant2) {
      setError('College name and both participant names are required');
      return;
    }
    if (participant1.toLocaleLowerCase() === participant2.toLocaleLowerCase()) {
      setError('Participant names must be different');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.register({
        collegeName: college,
        member1Name: participant1,
        member2Name: participant2,
      });
      loginTeam(response.team, response.token);
      navigate('/briefing', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="relative mx-auto max-w-lg py-4 sm:py-8">
        <div className="pointer-events-none absolute left-1/2 top-12 -z-10 h-[220px] w-[420px] max-w-[90vw] -translate-x-1/2 rounded-full bg-[#FDBA74]/[0.045] blur-[80px]" />
        <div className="animate-hero-reveal mb-8 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#FDBA74]">AVISHKAR 5.0</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Register Your Team</h1>
          <p className="mx-auto mt-2.5 max-w-md text-xs leading-relaxed text-[#A3A3A3] sm:text-sm">
            Register your college team. The first available team number will be assigned automatically.
          </p>
        </div>

        <form onSubmit={submit} className="animate-card-reveal card grid gap-5 rounded-2xl border border-[#333333] bg-[#171717] p-6 shadow-2xl shadow-black/60 sm:p-8">
          {error && <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 p-3.5 text-sm text-rose-200">{error}</div>}
          <div>
            <label className="label">College Name</label>
            <input className="input" type="text" placeholder="Enter your college name" value={collegeName} maxLength={120} onChange={(event) => setCollegeName(event.target.value)} required autoFocus />
          </div>
          <div>
            <label className="label">Participant 1 Name</label>
            <input className="input" type="text" placeholder="Enter first participant's full name" value={member1Name} maxLength={60} onChange={(event) => setMember1Name(event.target.value)} required />
          </div>
          <div>
            <label className="label">Participant 2 Name</label>
            <input className="input" type="text" placeholder="Enter second participant's full name" value={member2Name} maxLength={60} onChange={(event) => setMember2Name(event.target.value)} required />
          </div>
          <button type="submit" className="btn-primary mt-2 w-full py-3.5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting}>
            {submitting ? 'Registering…' : 'Register & Start Quiz →'}
          </button>
          <Link to="/" className="text-center text-sm text-[#A3A3A3] hover:text-white">← Back to home</Link>
        </form>
      </div>
    </PageShell>
  );
}
