export default function QuestionCard({ question, total, selected, onSelect, locked = false }) {
  if (!question) return null;

  return (
    <div className="card animate-fade-in p-6 sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FDBA74]">
          Question {question.order} <span className="text-[#A3A3A3]">/ {total}</span>
        </span>
        <span className="chip">
          {question.marks} mark{question.marks > 1 ? 's' : ''}
        </span>
      </div>

      {/* Large and centered question text */}
      <div className="my-6 flex justify-center">
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
            className="max-h-72 w-auto max-w-full rounded-lg border border-[#262626] bg-[#0A0A0A] object-contain p-2"
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
              className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-150
                ${
                  active
                    ? 'border-[#FDBA74] bg-[#171717] ring-1 ring-[#FDBA74] text-white shadow-sm'
                    : 'border-[#262626] bg-[#171717] text-[#A3A3A3] hover:border-[#383838] hover:text-white hover:bg-[#1C1C1C]'
                }
                ${locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors
                  ${
                    active
                      ? 'bg-[#FDBA74] text-[#0A0A0A]'
                      : 'bg-[#262626] text-[#A3A3A3] group-hover:bg-[#333333] group-hover:text-white'
                  }`}
              >
                {o.key}
              </span>
              <span className="text-sm font-medium sm:text-base">{o.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
