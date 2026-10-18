export default function QuestionCard({ question, total, selected, onSelect, locked = false }) {
  if (!question) return null;

  return (
    <div className="card animate-fade-in p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
          Question {question.order} <span className="text-slate-500">/ {total}</span>
        </span>
        <span className="chip">{question.marks} mark{question.marks > 1 ? 's' : ''}</span>
      </div>

      <h2 className="text-xl font-semibold leading-snug text-slate-50 sm:text-2xl">{question.questionText}</h2>

      {question.imageUrl && (
        <img
          src={`${import.meta.env.VITE_API_URL}${question.imageUrl}`}
          alt="Question visual"
          className="mt-5 max-h-80 w-full rounded-xl border border-slate-800 bg-slate-950 object-contain"
        />
      )}

      <div className="mt-6 grid gap-3">
        {question.options.map((o) => {
          const active = selected === o.key;
          return (
            <button
              key={o.key}
              type="button"
              disabled={locked}
              onClick={() => onSelect(o.key)}
              className={`group flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition
                ${active
                  ? 'border-indigo-400 bg-indigo-500/15 text-white shadow-lg shadow-indigo-950/30'
                  : 'border-slate-700 bg-slate-950/40 text-slate-200 hover:border-slate-500 hover:bg-slate-800/50'}
                ${locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition
                  ${active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'}`}
              >
                {o.key}
              </span>
              <span className="font-medium">{o.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
