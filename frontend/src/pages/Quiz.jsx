import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useTeam } from '../context/TeamContext';
import Logo from '../components/Logo';
import TeamBadge from '../components/TeamBadge';
import Timer from '../components/Timer';
import QuestionCard from '../components/QuestionCard';
import QuestionPalette from '../components/QuestionPalette';
import Spinner from '../components/Spinner';

const violationMessage = 'Warning: Tab switching/fullscreen exit detected. If this happens again, your quiz will be submitted automatically.';

function violationStorageKey(id) {
  return `qc_quiz_violations_${id}`;
}

export default function Quiz({ round = 1 }) {
  const { team } = useTeam();
  const navigate = useNavigate();
  const attemptKey = `qc_attempt_id_round_${round}`;

  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' | '' }
  const [attemptId, setAttemptId] = useState(null);
  const [current, setCurrent] = useState(0); // index into questions

  const [endsAt, setEndsAt] = useState(0);
  const [clockOffset, setClockOffset] = useState(0);
  const [now, setNow] = useState(Date.now());

  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [submitting, setSubmitting] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [violationWarning, setViolationWarning] = useState('');
  const submittedRef = useRef(false);
  const attemptIdRef = useRef(null);
  const submittingRef = useRef(false);
  const submitLockRef = useRef(false);
  const violationCountRef = useRef(0);
  const lastViolationAtRef = useRef(0);
  const leaveSignalActiveRef = useRef(false);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  const setViolationValue = (nextCount) => {
    violationCountRef.current = nextCount;
    setViolationCount(nextCount);
    if (attemptIdRef.current) {
      sessionStorage.setItem(violationStorageKey(attemptIdRef.current), String(nextCount));
    }
  };

  const submitForViolation = async () => {
    const id = attemptIdRef.current || localStorage.getItem(attemptKey);
    if (!id || submitLockRef.current || submittingRef.current || submittedRef.current) return;
    submitLockRef.current = true;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await api.submitAttempt(id, {});
    } catch {
      // If already submitted server-side, continue to done page.
    }
    localStorage.removeItem(attemptKey);
    sessionStorage.removeItem(violationStorageKey(id));
    navigate(`/done?round=${round}`, { replace: true });
  };

  const registerViolation = () => {
    if (loading || submittingRef.current || submittedRef.current) return;

    // Prevent accidental double-counting when multiple browser events fire for one action.
    const nowTs = Date.now();
    if (nowTs - lastViolationAtRef.current < 800) return;
    lastViolationAtRef.current = nowTs;

    const nextCount = violationCountRef.current + 1;
    setViolationValue(nextCount);

    if (nextCount === 1) {
      setViolationWarning(violationMessage);
      return;
    }

    setViolationWarning('');
    void submitForViolation();
  };

  const registerLeaveViolation = () => {
    if (leaveSignalActiveRef.current) return;
    leaveSignalActiveRef.current = true;
    registerViolation();
  };

  const clearLeaveSignal = () => {
    leaveSignalActiveRef.current = false;
  };

  // ---- Load (or resume) the attempt on mount ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let data = null;
        const savedId = localStorage.getItem(attemptKey);
        if (savedId) {
          try {
            data = await api.getAttempt(savedId);
          } catch (e) {
            if ([400, 401, 403, 404].includes(e.status)) {
              localStorage.removeItem(attemptKey);
              data = null;
            } else {
              throw e;
            }
          }
        }
        if (!data) {
          data = await api.startAttempt({ round });
        }
        if (cancelled) return;

        if (data.attempt.status === 'submitted') {
          submittedRef.current = true;
          localStorage.removeItem(attemptKey);
          navigate(`/done?round=${round}`, { replace: true });
          return;
        }

        localStorage.setItem(attemptKey, data.attempt._id);
        const ansMap = {};
        data.questions.forEach((q) => {
          ansMap[q._id] = data.answers[q._id] || '';
        });
        setQuestions(data.questions);
        setAnswers(ansMap);
        setAttemptId(data.attempt._id);
        attemptIdRef.current = data.attempt._id;

        const restoredViolations = Number(sessionStorage.getItem(violationStorageKey(data.attempt._id)) || '0');
        const safeViolations = Number.isFinite(restoredViolations) && restoredViolations > 0
          ? Math.floor(restoredViolations)
          : 0;
        setViolationValue(safeViolations);
        if (safeViolations > 0) setViolationWarning(violationMessage);

        setClockOffset(data.serverTime - Date.now());
        setEndsAt(data.attempt.startedAt + data.attempt.timeLimitSeconds * 1000);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        if (e.status === 409 && (e.data?.submitted === true || /already been submitted/i.test(e.message || ''))) {
          localStorage.removeItem(attemptKey);
          navigate(`/done?round=${round}`, { replace: true });
          return;
        }
        setFatalError(e.message || 'Failed to load the quiz.');
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, round]);

  // ---- Ticking clock ----
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const remainingMs = endsAt ? Math.max(0, endsAt - (now + clockOffset)) : 0;

  // ---- Tab switch + fullscreen anti-cheat ----
  useEffect(() => {
    if (loading) return undefined;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        registerLeaveViolation();
        return;
      }
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        clearLeaveSignal();
      }
    };

    const onWindowBlur = () => {
      registerLeaveViolation();
    };

    const onWindowFocus = () => {
      if (document.visibilityState === 'visible') {
        clearLeaveSignal();
      }
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) registerViolation();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focus', onWindowFocus);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('focus', onWindowFocus);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [loading]);

  // ---- Native leave/reload warning while quiz is active ----
  useEffect(() => {
    if (loading || submitting || submittedRef.current || !attemptId) return undefined;

    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [attemptId, loading, submitting]);

  // ---- Auto-submit on expiry ----
  useEffect(() => {
    if (!endsAt || submitting || submittedRef.current) return;
    if (remainingMs > 0) return;
    submittedRef.current = true;
    setSubmitting(true);
    (async () => {
      try {
        const id = localStorage.getItem(`qc_attempt_id_round_${round}`);
        if (id) await api.submitAttempt(id, {});
      } catch {
        /* server will auto-close on its side regardless */
      }
      if (attemptIdRef.current) sessionStorage.removeItem(violationStorageKey(attemptIdRef.current));
      localStorage.removeItem(`qc_attempt_id_round_${round}`);
      navigate(`/done?round=${round}`, { replace: true });
    })();
  }, [remainingMs, endsAt, submitting, navigate, round]);

  // ---- Answer selection (immediate save) ----
  const selectOption = async (optionKey) => {
    const q = questions[current];
    if (!q || !attemptId) return;
    const previous = answers[q._id];
    setAnswers((a) => ({ ...a, [q._id]: optionKey }));
    setSaveState('saving');
    try {
      await api.saveAnswer(attemptId, { questionId: q._id, selectedOption: optionKey });
      setSaveState('saved');
      setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 1400);
    } catch (e) {
      if (e.status === 410 || e.status === 409) {
        submittedRef.current = true;
        localStorage.removeItem(`qc_attempt_id_round_${round}`);
        navigate(`/done?round=${round}`, { replace: true });
        return;
      }
      setAnswers((a) => ({ ...a, [q._id]: previous }));
      setSaveState('error');
    }
  };

  const clearResponse = () => {
    const q = questions[current];
    if (!q || !attemptId) return;
    if (answers[q._id]) selectOption('');
  };

  const handleSubmit = async () => {
    if (submitting || submittedRef.current) return;
    const answered = Object.values(answers).filter(Boolean).length;
    const unanswered = questions.length - answered;
    const msg =
      unanswered > 0
        ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit Round ${round} anyway? This cannot be undone.`
        : `Submit Round ${round}? This cannot be undone.`;
    if (!window.confirm(msg)) return;

    setSubmitting(true);
    submittedRef.current = true;
    try {
      await api.submitAttempt(attemptId, {});
      if (attemptIdRef.current) sessionStorage.removeItem(violationStorageKey(attemptIdRef.current));
      localStorage.removeItem(`qc_attempt_id_round_${round}`);
      navigate(`/done?round=${round}`, { replace: true });
    } catch (e) {
      setSubmitting(false);
      submittedRef.current = false;
      setFatalError(e.message || 'Submission failed. Please try again.');
    }
  };

  const answersByOrder = useMemo(() => {
    const map = {};
    questions.forEach((q) => {
      map[q.order] = answers[q._id] || '';
    });
    return map;
  }, [questions, answers]);

  const answeredCount = Object.values(answersByOrder).filter(Boolean).length;

  if (fatalError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 text-center">
        <div className="card w-full p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">!</div>
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="mt-2 text-slate-400">{fatalError}</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-6">Try again</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Preparing your quiz…" />
      </div>
    );
  }

  const q = questions[current];
  const isFirst = current === 0;
  const isLast = current === questions.length - 1;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6">
      {/* Top bar */}
      <header className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4">
          <Logo subtitle={false} />
          <div className="hidden h-8 w-px bg-slate-800 sm:block" />
          <div className="hidden sm:block">
            <TeamBadge team={team} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Timer remainingMs={remainingMs} />
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary px-4 py-2.5 text-sm">
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Mobile team row */}
      <div className="mt-3 sm:hidden">
        <TeamBadge team={team} />
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-400">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      {violationWarning && (
        <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <div className="font-semibold">Warning</div>
          <div className="mt-1">{violationWarning}</div>
        </div>
      )}

      {/* Main grid */}
      <div className="mt-4 grid flex-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuestionCard
            question={q}
            total={questions.length}
            selected={answers[q._id] || ''}
            onSelect={selectOption}
            locked={submitting}
          />

          {/* Save indicator + Clear */}
          <div className="mt-3 flex items-center justify-between">
            <SaveIndicator state={saveState} />
            {answers[q._id] ? (
              <button onClick={clearResponse} className="btn-ghost px-3 py-2 text-xs">
                Clear response
              </button>
            ) : (
              <span />
            )}
          </div>

          {/* Navigation */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={isFirst} className="btn-ghost">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
              Previous
            </button>

            {isLast ? (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                Review &amp; Submit
              </button>
            ) : (
              <button onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))} className="btn-primary">
                Next
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <QuestionPalette
            total={questions.length}
            answersByOrder={answersByOrder}
            currentOrder={q.order}
            onJump={(order) => setCurrent(order - 1)}
            locked={submitting}
          />
          <div className="card p-4 text-xs leading-relaxed text-slate-400">
            <span className="font-semibold text-slate-300">Auto-submit:</span> the round closes by
            itself when the timer reaches zero. Your saved answers are always safe if you refresh.
          </div>
        </aside>
      </div>

      {submitting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <Spinner label="Submitting your round…" />
        </div>
      )}
    </div>
  );
}

function SaveIndicator({ state }) {
  if (state === 'saving')
    return <span className="text-xs text-slate-400">Saving…</span>;
  if (state === 'saved')
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Answer saved
      </span>
    );
  if (state === 'error')
    return <span className="text-xs text-rose-400">Save failed — retrying on next change</span>;
  return null;
}
