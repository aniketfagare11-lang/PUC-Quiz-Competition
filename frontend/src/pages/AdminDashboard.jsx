import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAdmin } from '../context/AdminContext';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';

const time = (value) => value ? new Date(value).toLocaleString() : '—';
const Tabs = [
  'Overview',
  'Teams',
  'Questions',
  'Quiz Results',
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAdmin();
  const [tab, setTab] = useState('Overview');
  const [data, setData] = useState({ overview: null, teams: [], results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [questionSet, setQuestionSet] = useState('A');
  const [activeSet, setActiveSet] = useState('A');
  const [activeSetSaving, setActiveSetSaving] = useState(false);
const [questions, setQuestions] = useState([]);
const [questionsLoading, setQuestionsLoading] = useState(false);
const [showQuestionForm, setShowQuestionForm] = useState(false);
const [editingQuestion, setEditingQuestion] = useState(null);

const emptyQuestion = {
  order: '',
  type: 'mcq',
  questionText: '',
  imageUrl: '',
  options: [
    { key: 'A', text: '' },
    { key: 'B', text: '' },
    { key: 'C', text: '' },
    { key: 'D', text: '' },
  ],
  correctAnswer: 'A',
  marks: 1,
};
const [questionForm, setQuestionForm] = useState(emptyQuestion);


  const load = useCallback(async () => {
    try {
      const [overview, teams, results] = await Promise.all([
        api.adminOverview(), api.adminTeams(), api.adminRankings(),
      ]);
      const registeredTeams = teams.teams || [];
      const teamDetails = new Map(
        registeredTeams.map((team) => [String(team.teamNumber), team])
      );
      const enrichedResults = (results.rankings || []).map((result) => {
        const team = teamDetails.get(String(result.teamNumber));
        return {
          ...result,
          collegeName: team?.collegeName || '',
          participants: team?.participants || result.participants || [],
        };
      });
      setData({ overview, teams: registeredTeams, results: enrichedResults });
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
      if (err.status === 401) {
        logoutAdmin();
        navigate('/admin', { replace: true });
      }
    } finally { setLoading(false); }
  }, [logoutAdmin, navigate]);

  const loadQuestions = useCallback(async () => {
  setQuestionsLoading(true);

  try {
    const result = await api.adminQuestions(questionSet);
    setQuestions(result.questions || []);
    setError('');
  } catch (err) {
    setError(err.message || 'Failed to load questions');
  } finally {
    setQuestionsLoading(false);
  }
}, [questionSet]);

  const loadActiveSet = useCallback(async () => {
    try {
      const result = await api.adminActiveSet();
      setActiveSet(result.activeSet);
    } catch (err) {
      setError(err.message || 'Failed to load active question set');
    }
  }, []);

  const changeActiveSet = async (value) => {
    setActiveSetSaving(true);
    try {
      const result = await api.adminSetActiveSet(value);
      setActiveSet(result.activeSet);
    } catch (err) {
      setError(err.message || 'Failed to change active question set');
    } finally {
      setActiveSetSaving(false);
    }
  };

useEffect(() => {
  if (tab === 'Questions') {
    loadQuestions();
  }
}, [tab, loadQuestions]);

const openAddQuestion = () => {
  setEditingQuestion(null);
  setQuestionForm({
    ...emptyQuestion,
    order: questions.length + 1,
    marks: 1,
  });
  setShowQuestionForm(true);
};

const openEditQuestion = (question) => {
  setShowQuestionForm(false);
  setEditingQuestion(question);
  setQuestionForm({
    order: question.order,
    type: question.type || 'mcq',
    questionText: question.questionText,
    imageUrl: question.imageUrl || '',
    options: question.options.map((option) => ({
      key: option.key,
      text: option.text,
    })),
    correctAnswer: question.correctAnswer || 'A',
    marks: question.marks || 1,
  });
};

const handleQuestionImage = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    setError('Please select an image file.');
    return;
  }

  // Keep MongoDB documents reasonably small.
  if (file.size > 2 * 1024 * 1024) {
    setError('Image must be smaller than 2 MB.');
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    setQuestionForm((current) => ({
      ...current,
      type: 'image',
      imageUrl: reader.result,
    }));
    setError('');
  };

  reader.onerror = () => {
    setError('Failed to read the image.');
  };

  reader.readAsDataURL(file);
};

const closeQuestionForm = () => {
  setShowQuestionForm(false);
  setEditingQuestion(null);
};

const saveQuestion = async () => {
  try {
    if (!questionForm.questionText.trim()) {
      setError('Question text is required');
      return;
    }

    if (questionForm.options.some((option) => !option.text.trim())) {
      setError('All four options are required');
      return;
    }

    const payload = {
      set: questionSet,
      order: Number(questionForm.order),
      type: 'mcq',
      questionText: questionForm.questionText.trim(),
      imageUrl: '',
      options: questionForm.options,
      correctAnswer: questionForm.correctAnswer,
      marks: Number(questionForm.marks) || 1,
    };

    if (editingQuestion) {
      await api.adminUpdateQuestion(editingQuestion._id, payload);
    } else {
      await api.adminCreateQuestion(payload);
    }

    setShowQuestionForm(false);
    setEditingQuestion(null);
    await loadQuestions();
  } catch (err) {
    setError(err.message || 'Failed to save question');
  }
};

const deleteQuestion = async (question) => {
  if (!window.confirm(`Delete Question ${question.order}?`)) return;

  try {
    await api.adminDeleteQuestion(question._id);
    await loadQuestions();
  } catch (err) {
    setError(err.message || 'Failed to delete question');
  }
};


  useEffect(() => { load(); loadActiveSet(); const id = setInterval(load, 8000); return () => clearInterval(id); }, [load, loadActiveSet]);
  const reset = async (teamNumber) => {
    if (!window.confirm(`Reset Team ${teamNumber} quiz attempt?`)) return;
    try { await api.adminResetAttempt(teamNumber); await load(); } catch (err) { setError(err.message); }
  };
  const forceSubmit = async (attempt) => {
    if (!window.confirm('Force-submit this attempt?')) return;
    try { await api.adminForceSubmit(attempt.attemptId); await load(); } catch (err) { setError(err.message); }
  };

  const downloadCSV = (rows, filename) => {
  const headers = ['Rank', 'College Name', 'Participant 1', 'Participant 2', 'Question Set', 'Answered', 'Score', 'Time Taken'];
  const dataRows = rows.map((row) => [
    row.rank,
    row.collegeName || '',
    row.participants?.[0] || '',
    row.participants?.[1] || '',
    row.set || '',
    `="${row.answeredCount ?? 0}/${row.totalQuestions ?? 0}"`,
    row.score ?? '',
    row.timeTakenSeconds != null ? `${Math.floor(row.timeTakenSeconds / 60)}m ${row.timeTakenSeconds % 60}s` : '',
  ]);

  const escapeCSV = (value) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const csv = [
    headers.map(escapeCSV).join(','),
    ...dataRows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

  if (loading) return <Spinner full label="Loading dashboard…" />;
  const overview = data.overview || {};
  return <div className="min-h-screen bg-[#0A0A0A]">
  <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <header className="card border-[#262626] bg-[#111111] px-5 py-4 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4"><Logo subtitle={false} /><div className="hidden h-9 w-px bg-[#333333] sm:block" /><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FDBA74]">Admin Dashboard</div><div className="mt-1 text-sm font-medium text-white">Signed in as {admin?.username}</div></div></div>
        <div className="flex flex-wrap items-center gap-2">
          <label title="Automatic assignment distributes sets A-D for new attempts; this value is retained for manual/legacy administration." className="flex items-center gap-2 rounded-lg border border-[#333333] bg-[#0A0A0A] px-3 py-1.5 text-sm text-[#D4D4D4]">Configured set<select className="bg-transparent font-semibold text-[#FDBA74] outline-none" value={activeSet} disabled={activeSetSaving} onChange={(event) => changeActiveSet(event.target.value)}>{['A', 'B', 'C', 'D'].map((set) => <option key={set} value={set}>Set {set}</option>)}</select></label>
          <button onClick={load} className="btn-ghost text-sm">Refresh</button><button onClick={() => { logoutAdmin(); navigate('/admin'); }} className="btn-ghost text-sm">Sign out</button>
        </div>
      </div>
    </header>
    {error && <div className="mt-4 rounded-xl border border-rose-900/40 bg-rose-950/20 p-3 text-sm text-rose-200">{error}</div>}
    <nav className="mt-5 flex gap-2 overflow-x-auto border-b border-[#262626] pb-3">{Tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${tab === item ? 'bg-[#FDBA74] text-[#0A0A0A]' : 'text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-white'}`}>{item}</button>)}</nav>
    {tab === 'Overview' && <section className="mt-6"><div className="mb-4"><h1 className="text-2xl font-bold tracking-tight text-white">Competition overview</h1><p className="mt-1 text-sm text-[#A3A3A3]">Live registration and quiz activity.</p></div><div className="grid gap-4 sm:grid-cols-3"><Stat label="Registered teams" value={overview.registered || 0} /><Stat label="Quiz submitted" value={overview.submitted || 0} /><Stat label="Quiz in progress" value={overview.inProgress || 0} /></div></section>}
    {tab === 'Teams' && <section className="card mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-[#262626] text-left text-xs uppercase text-[#A3A3A3]"><th className="p-4">Team</th><th className="p-4">Participants</th><th className="p-4">Assigned Set</th><th className="p-4">Submission Status</th><th className="p-4">Actions</th></tr></thead><tbody>{data.teams.map((team) => <tr key={team.teamNumber} className="border-t border-[#262626] hover:bg-[#1C1C1C] transition-colors"><td className="p-4 font-mono font-bold text-white">{String(team.teamNumber).padStart(2, '0')}</td><td className="p-4 text-white">
  <div className="font-medium">
    {team.collegeName || 'College not recorded'}
  </div>
  <div className="mt-1 text-sm text-[#A3A3A3]">
    {[team.participants?.[0], team.participants?.[1]]
      .filter(Boolean)
      .join(' · ')
      || 'Participants not recorded'}
  </div>
</td><td className="p-4 font-mono font-bold text-[#FDBA74]">{team.quiz?.set || '—'}</td><td className="p-4"><Status attempt={team.quiz} /></td><td className="p-4 space-x-2">{team.quiz && <span>{team.quiz.status === 'in-progress' && <button onClick={() => forceSubmit(team.quiz)} className="btn-ghost px-2 py-1 text-xs">Force submit</button>}<button onClick={() => reset(team.teamNumber)} className="btn-danger px-2 py-1 text-xs">Reset</button></span>}</td></tr>)}</tbody></table></section>}
    {tab === 'Questions' && (
  <section className="card mt-4 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-semibold text-white">Question Management</h2>
        <p className="mt-1 text-sm text-slate-400">
          Manage MCQs before the quiz starts.
        </p>
      </div>

      <button
        onClick={openAddQuestion}
        className="btn-primary text-sm"
      >
        + Add Question
      </button>
    </div>

    <div className="mt-5 flex gap-2">
      {['A', 'B', 'C', 'D'].map((set) => (
        <button
        key={set}
          onClick={() => {
          setQuestionSet(set);
            setShowQuestionForm(false);
          }}
          className={
          questionSet === set
              ? 'btn-primary text-sm'
              : 'btn-ghost text-sm'
          }
        >
        Set {set}
        </button>
      ))}
    </div>

    {showQuestionForm && (
  <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="font-semibold text-white">Add Question</h3>

      <button
        type="button"
        onClick={closeQuestionForm}
        className="btn-ghost px-2 py-1 text-xs"
      >
        Cancel
      </button>
    </div>

    <div className="grid gap-3">

      {/* Question number + marks */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-slate-300">
          <span className="mb-1 block">Question number</span>

          <input
            className="input"
            type="number"
            min="1"
            value={questionForm.order}
            onChange={(e) =>
              setQuestionForm({
                ...questionForm,
                order: e.target.value,
              })
            }
          />
        </label>

        <label className="block text-sm text-slate-300">
          <span className="mb-1 block">Marks</span>

          <input
            className="input"
            type="number"
            min="1"
            value={questionForm.marks}
            onChange={(e) =>
              setQuestionForm({
                ...questionForm,
                marks: e.target.value,
              })
            }
          />
        </label>
      </div>

      {/* Optional image-question controls are reserved for future question types. */}
      {false && (
        <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block">Question type</span>

            <select
              className="input"
              value={questionForm.type}
              onChange={(e) =>
                setQuestionForm({
                  ...questionForm,
                  type: e.target.value,
                  imageUrl:
                    e.target.value === 'mcq'
                      ? ''
                      : questionForm.imageUrl,
                })
              }
            >
              <option value="mcq">Text MCQ</option>
              <option value="image">Image Question</option>
            </select>
          </label>

          {questionForm.type === 'image' && (
            <div className="mt-3">
              <label className="block text-sm text-slate-300">
                <span className="mb-1 block">Question Image</span>

                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-slate-300"
                  onChange={handleQuestionImage}
                />
              </label>

              {questionForm.imageUrl && (
                <div className="mt-3 rounded-lg border border-slate-700 p-2">
                  <img
                    src={questionForm.imageUrl}
                    alt="Question preview"
                    className="max-h-64 max-w-full rounded object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Question text */}
      <label className="block text-sm text-slate-300">
        <span className="mb-1 block">Question text</span>

        <textarea
          className="input min-h-20"
          value={questionForm.questionText}
          onChange={(e) =>
            setQuestionForm({
              ...questionForm,
              questionText: e.target.value,
            })
          }
        />
      </label>

      {/* Options */}
      <div className="grid gap-3 sm:grid-cols-2">
        {questionForm.options.map((option, index) => (
          <label
            key={option.key}
            className="block text-sm text-slate-300"
          >
            <span className="mb-1 block">
              Option {option.key}
            </span>

            <input
              className="input"
              value={option.text}
              onChange={(e) => {
                const options = [...questionForm.options];

                options[index] = {
                  ...options[index],
                  text: e.target.value,
                };

                setQuestionForm({
                  ...questionForm,
                  options,
                });
              }}
            />
          </label>
        ))}
      </div>

      {/* Correct answer */}
      <label className="block text-sm text-slate-300">
        <span className="mb-1 block">Correct answer</span>

        <select
          className="input"
          value={questionForm.correctAnswer}
          onChange={(e) =>
            setQuestionForm({
              ...questionForm,
              correctAnswer: e.target.value,
            })
          }
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
      </label>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={closeQuestionForm}
          className="btn-ghost text-sm"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={saveQuestion}
          className="btn-primary text-sm"
        >
          Add Question
        </button>
      </div>

    </div>
  </div>
)}
    {questionsLoading ? (
      <div className="py-10 text-center text-slate-400">
        Loading questions...
      </div>
    ) : questions.length === 0 ? (
      <div className="py-10 text-center text-slate-400">
        No questions found for Set {questionSet}.
      </div>
    ) : (
      <div className="mt-5 space-y-3">
        {questions.map((question) => (
          <div
            key={question._id}
            className="rounded-xl border border-slate-800 p-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Question {question.order}
                </div>

                <div className="mt-2 text-sm font-medium text-white">
                  {question.questionText}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => (
                    <div
                      key={option.key}
                      className="rounded-lg bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
                    >
                      <span className="font-semibold text-slate-100">
                        {option.key}.
                      </span>{' '}
                      {option.text}
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-[11px] text-emerald-400">
                  Correct answer: {question.correctAnswer || 'Hidden'}
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => openEditQuestion(question)}
                  className="btn-ghost px-3 py-1 text-[11px]"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteQuestion(question)}
                  className="btn-danger px-3 py-1 text-[11px]"
                >
                  Delete
                </button>
              </div>
            </div>

            {editingQuestion && editingQuestion._id === question._id && (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/80 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-medium text-white">Edit Question</h4>
                  <button
                    type="button"
                    onClick={closeQuestionForm}
                    className="btn-ghost px-2 py-1 text-[11px]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm text-slate-300">
                      <span className="mb-1 block">Question number</span>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        value={questionForm.order}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            order: e.target.value,
                          })
                        }
                      />
                    </label>

                    <label className="block text-sm text-slate-300">
                      <span className="mb-1 block">Marks</span>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        value={questionForm.marks}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            marks: e.target.value,
                          })
                        }
                      />
                    </label>
                  </div>

                  <label className="block text-sm text-slate-300">
                    <span className="mb-1 block">Question text</span>
                    <textarea
                      className="input min-h-20"
                      value={questionForm.questionText}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          questionText: e.target.value,
                        })
                      }
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {questionForm.options.map((option, index) => (
                      <label key={option.key} className="block text-sm text-slate-300">
                        <span className="mb-1 block">Option {option.key}</span>
                        <input
                          className="input"
                          value={option.text}
                          onChange={(e) => {
                            const options = [...questionForm.options];
                            options[index] = {
                              ...options[index],
                              text: e.target.value,
                            };

                            setQuestionForm({
                              ...questionForm,
                              options,
                            });
                          }}
                        />
                      </label>
                    ))}
                  </div>

                  <label className="block text-sm text-slate-300">
                    <span className="mb-1 block">Correct answer</span>
                    <select
                      className="input"
                      value={questionForm.correctAnswer}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          correctAnswer: e.target.value,
                        })
                      }
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </label>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={closeQuestionForm}
                      className="btn-ghost text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveQuestion}
                      className="btn-primary text-sm"
                    >
                      Update Question
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </section>
)}

{tab === 'Quiz Results' && <section className="card mt-4 overflow-x-auto">
  <div className="flex flex-wrap items-center justify-between gap-3 p-5">
    <h2 className="font-semibold text-white">Quiz Results</h2>

    <button
      onClick={() => downloadCSV(data.results, 'quiz-results.csv')}
      className="btn-primary text-sm"
    >
      Download CSV
    </button>
  </div>
  <ResultsTable rows={data.results} />
</section>}
    <div className="mt-5 text-sm text-[#A3A3A3]"><Link to="/quiz" className="text-[#FDBA74] hover:underline">View participant site →</Link></div>
  </div>
  </div>;
}
function Stat({ label, value }) { return <div className="card border-[#262626] bg-[#171717] p-5 shadow-lg shadow-black/10"><div className="h-1 w-10 rounded-full bg-[#FDBA74]" /><div className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#A3A3A3]">{label}</div><div className="mt-1 font-mono text-3xl font-bold text-white">{value}</div></div>; }
function Status({ attempt }) {
  if (!attempt) return <span className="text-[#737373]">Not started</span>;
  if (attempt.status !== 'submitted') return <span className="text-white">In progress</span>;

  const answeredCount = (attempt.answers || [])
    .filter((answer) => answer.selectedOption)
    .length;

  return (
    <span className="text-[#FDBA74] font-medium">
      Submitted · {answeredCount}/{attempt.totalQuestions} questions
    </span>
  );
}
function ResultsTable({ rows }) { return <table className="w-full text-sm"><thead><tr className="border-b border-[#262626] text-left text-xs uppercase text-[#A3A3A3]"><th className="p-4">Rank</th><th className="p-4">College Name</th><th className="p-4">Participant 1</th><th className="p-4">Participant 2</th><th className="p-4">Question Set</th><th className="p-4">Answered</th><th className="p-4">Score</th><th className="p-4">Time</th><th className="p-4">Submission Type</th></tr></thead><tbody>{rows.map((row) => <tr key={row.teamNumber} className="border-t border-[#262626] hover:bg-[#1C1C1C] transition-colors"><td className="p-4 font-bold text-white">{row.rank}</td><td className="p-4 text-white">{row.collegeName || '—'}</td><td className="p-4 text-white">{row.participants?.[0] || '—'}</td><td className="p-4 text-white">{row.participants?.[1] || '—'}</td><td className="p-4 font-mono font-bold text-[#FDBA74]">{row.set || '—'}</td><td className="p-4 font-mono text-[#A3A3A3]">{row.answeredCount ?? 0}/{row.totalQuestions ?? 0}</td><td className="p-4 font-mono font-bold text-[#FDBA74]">{row.score ?? '—'}</td>
<td className="p-4 font-mono text-[#A3A3A3]">
  {row.timeTakenSeconds != null
    ? `${Math.floor(row.timeTakenSeconds / 60)}m ${row.timeTakenSeconds % 60}s`
    : '—'}
</td>
 <td className="p-4 text-white">{row.status === 'submitted' ? (row.submissionType || 'Submitted') : 'In progress'}</td></tr>)}</tbody></table>; }
