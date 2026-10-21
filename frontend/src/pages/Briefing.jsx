import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../context/TeamContext';
import { api } from '../api/client';
import Logo from '../components/Logo';

const DEFAULT_RULES = [
  ['+1', 'Mark per correct answer'],
  ['0', 'Negative marking'],
];

export default function Briefing() {
  const navigate = useNavigate();
  const { team } = useTeam();
  const [quizInfo, setQuizInfo] = useState(null);
  const [infoError, setInfoError] = useState('');
  const [fullscreenError, setFullscreenError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(
    () => document.fullscreenElement === document.documentElement,
  );
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.quizInfo()
      .then((data) => {
        if (!cancelled) setQuizInfo(data);
      })
      .catch((error) => {
        if (!cancelled) setInfoError(error.message || 'Could not load quiz configuration.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === document.documentElement);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    onFullscreenChange();
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const start = async () => {
    if (starting) return;
    setFullscreenError('');
    setStarting(true);

    try {
      // Keep the fullscreen element mounted while routing to Quiz.
      const target = document.documentElement;
      if (document.fullscreenElement !== target) {
        if (typeof target.requestFullscreen !== 'function') {
          throw new Error('Fullscreen is not available in this browser.');
        }
        await target.requestFullscreen();
      }

      if (document.fullscreenElement !== target) {
        throw new Error('Fullscreen was not enabled. Please try again.');
      }

      navigate('/quiz');
    } catch (error) {
      setFullscreenError(
        `${error?.message || 'Fullscreen could not be enabled.'} Some mobile or in-app browsers do not support fullscreen reliably. Please open the quiz in a supported browser and retry.`,
      );
      setStarting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Logo />
      </header>

      <main className="flex flex-1 flex-col justify-center py-8">
        <div className="card animate-fade-in p-7 sm:p-9">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FDBA74]">Ready, set…</div>
              <h1 className="mt-1 text-3xl font-extrabold text-white">Quiz briefing</h1>
            </div>
          </div>

          <p className="mt-4 text-[#A3A3A3]">
            Welcome, <span className="font-semibold text-white">{team?.member1Name}</span> &{' '}
            <span className="font-semibold text-white">{team?.member2Name}</span>! Review the rules
            below. The timer starts after fullscreen is enabled and you press <span className="font-semibold text-[#FDBA74]">Start Quiz</span>.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [`${quizInfo?.questionCount ?? '—'}`, 'Multiple-choice questions'],
              [
                quizInfo?.timeLimitSeconds
                  ? `${Math.floor(quizInfo.timeLimitSeconds / 60)}:${String(quizInfo.timeLimitSeconds % 60).padStart(2, '0')}`
                  : '—',
                'Total time (auto-submits at zero)',
              ],
              ...DEFAULT_RULES,
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-4 text-center">
                <div className="font-mono text-2xl font-bold text-white">{n}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-[#A3A3A3]">{l}</div>
              </div>
            ))}
          </div>

          {infoError && (
            <div role="alert" className="mt-6 rounded-xl border border-rose-900/40 bg-rose-950/30 p-3.5 text-sm text-rose-200">
              {infoError}
            </div>
          )}

          <ul className="mt-6 space-y-2 text-sm text-[#A3A3A3]">
            <li className="flex gap-2"><span className="text-[#FDBA74]">›</span> Navigate freely — Next, Previous, and the question palette.</li>
            <li className="flex gap-2"><span className="text-[#FDBA74]">›</span> You can revisit and change answers any time before submitting.</li>
            <li className="flex gap-2"><span className="text-[#FDBA74]">›</span> Refreshing the page is safe — your timer and answers are saved.</li>
            <li className="flex gap-2"><span className="text-[#FDBA74]">›</span> Scores are kept secret until the whole competition ends.</li>
          </ul>

          {fullscreenError && (
            <div role="alert" className="mt-6 rounded-xl border border-rose-900/40 bg-rose-950/30 p-3.5 text-sm text-rose-200">
              {fullscreenError}
            </div>
          )}

          <button onClick={start} disabled={starting} className="btn-primary mt-8 w-full text-base sm:text-lg disabled:cursor-not-allowed disabled:opacity-60">
            {starting ? 'Entering Fullscreen…' : isFullscreen ? 'Start Quiz' : 'Enter Fullscreen & Start Quiz'}
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
