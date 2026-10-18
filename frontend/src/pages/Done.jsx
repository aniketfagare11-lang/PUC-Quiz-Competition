import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTeam } from '../context/TeamContext';
import Logo from '../components/Logo';

export default function Done() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const round = Number(params.get('round')) || 1;
  const { team, logoutTeam } = useTeam();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Logo />
        <button
          onClick={() => {
            logoutTeam();
            navigate('/');
          }}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          Exit
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center py-10 text-center">
        <div className="card animate-fade-in w-full p-8 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-white">Round {round} Submitted!</h1>
          <p className="mt-2 text-slate-300">
            Nicely done{team ? `, Team ${team.teamNumber}` : ''}. Your answers are locked in.
          </p>

          <div className="mt-6 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 text-sm text-indigo-100">
            <span className="font-semibold">Scores stay sealed.</span> Your result will be revealed at
            the final leaderboard announcement — no peeking!
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {team ? (
              <button
                onClick={() => {
                  logoutTeam();
                  navigate('/team');
                }}
                className="btn-ghost"
              >
                Done — free up this PC
              </button>
            ) : (
              <Link to="/" className="btn-ghost">Back to home</Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
