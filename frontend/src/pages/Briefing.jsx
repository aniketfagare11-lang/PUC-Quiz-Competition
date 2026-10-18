import { useNavigate } from 'react-router-dom';
import { useTeam } from '../context/TeamContext';
import Logo from '../components/Logo';
import TeamBadge from '../components/TeamBadge';

const RULES = [
  ['30', 'Multiple-choice questions'],
  ['20:00', 'Total time (auto-submits at zero)'],
  ['+1', 'Mark per correct answer'],
  ['0', 'Negative marking'],
];

export default function Briefing() {
  const navigate = useNavigate();
  const { team, logoutTeam } = useTeam();

  const start = () => navigate('/quiz');

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Logo />
        <button
          onClick={() => {
            logoutTeam();
            navigate('/team');
          }}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          Switch team
        </button>
      </header>

      <main className="flex flex-1 flex-col justify-center py-8">
        <div className="card animate-fade-in p-7 sm:p-9">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Ready, set…</div>
              <h1 className="mt-1 text-3xl font-extrabold text-white">Round 1 — Briefing</h1>
            </div>
            <TeamBadge team={team} />
          </div>

          <p className="mt-4 text-slate-300">
            Welcome, <span className="font-semibold text-white">{team?.member1Name}</span> &{' '}
            <span className="font-semibold text-white">{team?.member2Name}</span>! Review the rules
            below. The timer starts the moment you press <span className="font-semibold">Start</span>.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {RULES.map(([n, l]) => (
              <div key={l} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-center">
                <div className="font-mono text-2xl font-bold text-white">{n}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">{l}</div>
              </div>
            ))}
          </div>

          <ul className="mt-6 space-y-2 text-sm text-slate-300">
            <li className="flex gap-2"><span className="text-indigo-400">›</span> Navigate freely — Next, Previous, and the question palette.</li>
            <li className="flex gap-2"><span className="text-indigo-400">›</span> You can revisit and change answers any time before submitting.</li>
            <li className="flex gap-2"><span className="text-indigo-400">›</span> Refreshing the page is safe — your timer and answers are saved.</li>
            <li className="flex gap-2"><span className="text-indigo-400">›</span> Scores are kept secret until the whole competition ends.</li>
          </ul>

          <button onClick={start} className="btn-primary mt-8 w-full text-lg">
            Start Round 1
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
