export default function QuestionCard({
  question,
  total,
  selected,
  onSelect,
  onClear,
  isFlagged = false,
  onToggleFlag,
  locked = false,
}) {
  if (!question) return null;

  return (
    <div className="card animate-fade-in p-6 sm:p-8 shadow-sm">
      {/* Top Meta Row: Question Number, Marks & Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FDBA74]">
          Question {question.order} <span className="text-[#A3A3A3]">/ {total}</span>
        </span>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Flag for review button */}
          {onToggleFlag && (
            <button
              type="button"
              disabled={locked}
              onClick={() => onToggleFlag(question._id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all duration-150 ${
                isFlagged
                  ? 'border-[#FDBA74] bg-[#FDBA74]/15 text-[#FDBA74]'
                  : 'border-[#333333] bg-[#141414] text-[#A3A3A3] hover:border-[#4B4B4B] hover:text-white'
              } ${locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95'}`}
              title={isFlagged ? 'Remove flag' : 'Flag question for review'}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={isFlagged ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
            </button>
          )}

          {/* Clear response option */}
          {selected && onClear && (
            <button
              type="button"
              disabled={locked}
              onClick={onClear}
              className="text-xs text-[#A3A3A3] hover:text-white transition-colors underline-offset-4 hover:underline disabled:opacity-40"
            >
              Clear response
            </button>
          )}

          {/* Marks Chip */}
          <span className="chip">
            {question.marks} mark{question.marks > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Large and centered question text */}
      <div className="my-6 sm:my-8 flex justify-center">
        <h2 className="max-w-3xl text-center text-xl font-bold leading-relaxed text-white sm:text-2xl md:text-3xl">
          {question.questionText}
        </h2>
      </div>

      {/* Image centered (never beside question) */}
      {question.imageUrl && (
        <div className="my-6 flex justify-center">
          <img
            src={`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}${question.imageUrl}`}
            alt="Question visual"
            className="max-h-72 w-auto max-w-full rounded-xl border border-[#333333] bg-[#0A0A0A] object-contain p-2"
          />
        </div>
      )}

      {/* Four answer options in 2x2 grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {question.options.map((o) => {
          const active = selected === o.key;
          return (
            <button
              key={o.key}
              type="button"
              disabled={locked}
              onClick={() => onSelect(o.key)}
              className={`group relative flex items-center gap-4 rounded-xl border p-4 sm:p-5 text-left transition-all duration-150 outline-none
                ${
                  active
                    ? 'border-[#FDBA74] bg-[#1A1815] ring-1 ring-[#FDBA74] text-white shadow-sm'
                    : 'border-[#333333] bg-[#141414] text-[#A3A3A3] hover:border-[#4B4B4B] hover:text-white hover:bg-[#1C1C1C] focus-visible:border-[#FDBA74]'
                }
                ${locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer active:scale-[0.99]'}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all duration-150
                  ${
                    active
                      ? 'bg-[#FDBA74] text-[#0A0A0A] shadow-sm'
                      : 'border border-[#333333] bg-[#202020] text-[#A3A3A3] group-hover:bg-[#2A2A2A] group-hover:text-white group-hover:border-[#444444]'
                  }`}
              >
                {o.key}
              </span>
              <span className={`text-sm sm:text-base font-medium leading-snug flex-1 ${active ? 'text-white font-semibold' : ''}`}>
                {o.text}
              </span>
              {active && (
                <span className="shrink-0 text-[#FDBA74]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
