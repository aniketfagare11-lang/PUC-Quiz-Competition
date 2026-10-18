export default function QuestionPalette({ total, answersByOrder, currentOrder, onJump, locked = false }) {
  const answeredCount = Object.values(answersByOrder).filter(Boolean).length;

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Question Palette</h3>
        <span className="text-xs font-medium text-slate-400">
          {answeredCount}/{total} answered
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2 sm:grid-cols-5">
        {Array.from({ length: total }, (_, i) => {
          const order = i + 1;
          const answered = !!answersByOrder[order];
          const isCurrent = order === currentOrder;

          let cls = 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700';
          if (answered) cls = 'border-transparent bg-indigo-500 text-white hover:bg-indigo-400';
          if (isCurrent) {
            cls = answered
              ? 'border-transparent bg-indigo-500 text-white ring-2 ring-indigo-300 ring-offset-2 ring-offset-slate-900'
              : 'border-indigo-400 bg-slate-950 text-indigo-200 ring-2 ring-indigo-400/60';
          }

          return (
            <button
              key={order}
              type="button"
              disabled={locked}
              onClick={() => onJump(order)}
              className={`h-9 rounded-lg border text-sm font-semibold transition ${cls} ${locked ? 'cursor-not-allowed' : ''}`}
            >
              {order}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[3px] bg-indigo-500" /> Answered
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[3px] border border-slate-600" /> Unanswered
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[3px] ring-2 ring-indigo-400/60" /> Current
        </span>
      </div>
    </div>
  );
}
