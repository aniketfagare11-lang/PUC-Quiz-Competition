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
  'Round 1 Results',
  'Round 2 Results',
  'Combined Results',
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAdmin();
  const [tab, setTab] = useState('Overview');
  const [data, setData] = useState({ overview: null, teams: [], round1: [], round2: [], combined: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [questionRound, setQuestionRound] = useState(1);
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
      const [overview, teams, round1, round2, combined] = await Promise.all([
        api.adminOverview(), api.adminTeams(), api.adminRankings(1), api.adminRankings(2), api.adminCombinedResults(),
      ]);
      setData({ overview, teams: teams.teams, round1: round1.rankings, round2: round2.rankings, combined: combined.results });
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
    const result = await api.adminQuestions(questionRound);
    setQuestions(result.questions || []);
    setError('');
  } catch (err) {
    setError(err.message || 'Failed to load questions');
  } finally {
    setQuestionsLoading(false);
  }
}, [questionRound]);

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
      round: questionRound,
      order: Number(questionForm.order),
      type: questionRound === 2 ? questionForm.type : 'mcq',
      questionText: questionForm.questionText.trim(),
      imageUrl: questionRound === 2 ? questionForm.imageUrl : '',
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


  useEffect(() => { load(); const id = setInterval(load, 8000); return () => clearInterval(id); }, [load]);
  const reset = async (teamNumber, round) => {
    if (!window.confirm(`Reset Team ${teamNumber} Round ${round}?`)) return;
    try { await api.adminResetAttempt(teamNumber, round); await load(); } catch (err) { setError(err.message); }
  };
  const forceSubmit = async (attempt) => {
    if (!window.confirm('Force-submit this attempt?')) return;
    try { await api.adminForceSubmit(attempt.attemptId); await load(); } catch (err) { setError(err.message); }
  };

  const downloadCSV = (rows, filename, type) => {
  let headers;
  let dataRows;

  if (type === 'combined') {
    headers = [
      'Rank',
      'Team',
      'Participants',
      'Round 1 Score',
      'Round 1 Time',
      'Round 2 Score',
      'Round 2 Time',
      'Total Score',
      'Total Time',
    ];

    dataRows = rows.map((row) => [
      row.rank,
      row.teamNumber,
      row.participants?.join(' · ') || '',
      row.round1Score ?? '',
      row.round1Time != null
        ? `${Math.floor(row.round1Time / 60)}m ${row.round1Time % 60}s`
        : '',
      row.round2Score ?? '',
      row.round2Time != null
        ? `${Math.floor(row.round2Time / 60)}m ${row.round2Time % 60}s`
        : '',
      row.total ?? '',
      row.totalTime != null
        ? `${Math.floor(row.totalTime / 60)}m ${row.totalTime % 60}s`
        : '',
    ]);
  } else {
    headers = [
      'Rank',
      'Team',
      'Participants',
      'Score',
      'Time Taken',
      'Submission Type',
    ];

    dataRows = rows.map((row) => [
      row.rank,
      row.teamNumber,
      row.participants?.join(' · ') || '',
      row.score ?? '',
      row.timeTakenSeconds != null
        ? `${Math.floor(row.timeTakenSeconds / 60)}m ${row.timeTakenSeconds % 60}s`
        : '',
      row.submissionType || 'submitted',
    ]);
  }

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
  return <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
    <header className="card flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div className="flex items-center gap-4"><Logo subtitle={false} /><div><div className="text-xs uppercase tracking-widest text-slate-400">Admin Dashboard</div><div className="text-sm font-semibold text-white">Signed in as {admin?.username}</div></div></div><div className="flex gap-2"><button onClick={load} className="btn-ghost text-sm">Refresh</button><button onClick={() => { logoutAdmin(); navigate('/admin'); }} className="btn-ghost text-sm">Sign out</button></div></header>
    {error && <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}
    <nav className="mt-4 flex flex-wrap gap-2">{Tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={tab === item ? 'btn-primary text-sm' : 'btn-ghost text-sm'}>{item}</button>)}</nav>
    {tab === 'Overview' && <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Stat label="Teams" value={overview.registered || 0} /><Stat label="R1 submitted" value={overview.submitted || 0} /><Stat label="R2 submitted" value={overview.round2Submitted || 0} /><Stat label="R2 live" value={overview.round2InProgress || 0} /></section>}
    {tab === 'Teams' && <section className="card mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="p-4">Team</th><th className="p-4">Participants</th><th className="p-4">Round 1</th><th className="p-4">Round 2</th><th className="p-4">Actions</th></tr></thead><tbody>{data.teams.map((team) => <tr key={team.teamNumber} className="border-t border-slate-800"><td className="p-4 font-mono font-bold">{String(team.teamNumber).padStart(2, '0')}</td><td className="p-4">{team.participants.join(' · ') || '—'}</td><td className="p-4"><Status attempt={team.round1} /></td><td className="p-4"><Status attempt={team.round2} /></td><td className="p-4 space-x-2">{[team.round1, team.round2].filter(Boolean).map((attempt) => <span key={attempt.attemptId}>{attempt.status === 'in-progress' && <button onClick={() => forceSubmit(attempt)} className="btn-ghost px-2 py-1 text-xs">Force submit</button>}<button onClick={() => reset(team.teamNumber, attempt.round || (attempt === team.round1 ? 1 : 2))} className="btn-danger px-2 py-1 text-xs">Reset</button></span>)}</td></tr>)}</tbody></table></section>}
    {tab === 'Questions' && (
  <section className="card mt-4 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-semibold text-white">Question Management</h2>
        <p className="mt-1 text-sm text-slate-400">
          Manage MCQs before the round starts.
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
      {[1, 2].map((round) => (
        <button
          key={round}
          onClick={() => {
            setQuestionRound(round);
            setShowQuestionForm(false);
          }}
          className={
            questionRound === round
              ? 'btn-primary text-sm'
              : 'btn-ghost text-sm'
          }
        >
          Round {round}
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

      {/* Round 2 question type + image */}
      {questionRound === 2 && (
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
        No questions found for Round {questionRound}.
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

{tab === 'Round 1 Results' && (
  <>
    <div className="mt-4 flex justify-end">
      <button
        onClick={() => downloadCSV(data.round1, 'round-1-results.csv', 'round')}
        className="btn-primary text-sm"
      >
        Download CSV
      </button>
    </div>
    <Results rows={data.round1} title="Round 1 Results" />
  </>
)}

{tab === 'Round 2 Results' && (
  <>
    <div className="mt-4 flex justify-end">
      <button
        onClick={() => downloadCSV(data.round2, 'round-2-results.csv', 'round')}
        className="btn-primary text-sm"
      >
        Download CSV
      </button>
    </div>
    <Results rows={data.round2} title="Round 2 Results" />
  </>
)}
    {tab === 'Combined Results' && <section className="card mt-4 overflow-x-auto">
  <div className="flex items-center justify-between p-5">
    <h2 className="font-semibold text-white">Combined Results</h2>

    <button
      onClick={() =>
        downloadCSV(
          data.combined,
          'combined-results.csv',
          'combined'
        )
      }
      className="btn-primary text-sm"
    >
      Download CSV
    </button>
  </div>
  <h2 className="p-5 font-semibold text-white">Combined Results</h2><table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="p-4">Rank</th><th className="p-4">Team</th><th className="p-4">Participants</th><th className="p-4">Round 1</th>
<th className="p-4">R1 Time</th>
<th className="p-4">Round 2</th>
<th className="p-4">R2 Time</th>
<th className="p-4">Total</th>
<th className="p-4">Total Time</th></tr></thead><tbody>{data.combined.map((row) => <tr key={row.teamNumber} className="border-t border-slate-800"><td className="p-4">{row.rank}</td><td className="p-4 font-mono">{String(row.teamNumber).padStart(2, '0')}</td><td className="p-4">{row.participants.join(' · ') || '—'}</td><td className="p-4">{row.round1Score ?? '—'}</td>

<td className="p-4 font-mono">
  {row.round1Time != null
    ? `${Math.floor(row.round1Time / 60)}m ${row.round1Time % 60}s`
    : '—'}
</td>

<td className="p-4">{row.round2Score ?? '—'}</td>

<td className="p-4 font-mono">
  {row.round2Time != null
    ? `${Math.floor(row.round2Time / 60)}m ${row.round2Time % 60}s`
    : '—'}
</td>

<td className="p-4 font-mono font-bold">{row.total}</td>

<td className="p-4 font-mono font-bold">
  {row.totalTime != null
    ? `${Math.floor(row.totalTime / 60)}m ${row.totalTime % 60}s`
    : '—'}
</td></tr>)}</tbody></table></section>}
    <div className="mt-5 text-sm text-slate-400"><Link to="/round1" className="hover:text-white">View participant site →</Link></div>
  </div>;
}
function Stat({ label, value }) { return <div className="card p-4"><div className="text-xs uppercase text-slate-400">{label}</div><div className="mt-1 font-mono text-3xl font-bold text-white">{value}</div></div>; }
function Status({ attempt }) { return !attempt ? <span className="text-slate-500">Not started</span> : <span>{attempt.status === 'submitted' ? `Submitted · ${attempt.score}` : 'In progress'}</span>; }
function Results({ rows, title }) { return <section className="card mt-4 overflow-x-auto"><h2 className="p-5 font-semibold text-white">{title}</h2><table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="p-4">Rank</th><th className="p-4">Team</th><th className="p-4">Participants</th><th className="p-4">Score</th>
<th className="p-4">Time Taken</th>
<th className="p-4">Status</th>
<th className="p-4">Time Taken</th></tr></thead><tbody>{rows.map((row) => <tr key={row.teamNumber} className="border-t border-slate-800"><td className="p-4">{row.rank}</td><td className="p-4 font-mono">{String(row.teamNumber).padStart(2, '0')}</td><td className="p-4">{row.participants.join(' · ')}</td><td className="p-4 font-mono">{row.score}</td>
<td className="p-4 font-mono">
  {row.timeTakenSeconds != null
    ? `${Math.floor(row.timeTakenSeconds / 60)}m ${row.timeTakenSeconds % 60}s`
    : '—'}
</td>
<td className="p-4">{row.submissionType || 'submitted'}</td>
<td className="p-4 font-mono">
  {row.timeTakenSeconds != null
    ? `${Math.floor(row.timeTakenSeconds / 60)}m ${row.timeTakenSeconds % 60}s`
    : '—'}
</td></tr>)}</tbody></table></section>; }
