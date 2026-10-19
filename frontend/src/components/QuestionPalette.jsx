export default function QuestionPalette({ total, answersByOrder, currentOrder, onJump, locked = false }) {
  const answeredCount = Object.values(answersByOrder).filter(Boolean).length;

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Question Palette</h3>
        <span className="text-xs font-medium text-[#A3A3A3]">
          {answeredCount}/{total} answered
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2 sm:grid-cols-5">
        {Array.from({ length: total }, (_, i) => {
          const order = i + 1;
          const answered = !!answersByOrder[order];
          const isCurrent = order === currentOrder;

          let cls = 'border-[#262626] bg-[#171717] text-[#A3A3A3] hover:border-[#383838] hover:text-white';
          if (answered) {
            cls = 'border-transparent bg-[#FDBA74] text-[#0A0A0A] hover:bg-[#FED7AA] font-bold';
          }
          if (isCurrent) {
            cls = answered
              ? 'border-transparent bg-[#FDBA74] text-[#0A0A0A] font-bold ring-2 ring-[#FDBA74] ring-offset-2 ring-offset-[#0A0A0A]'
              : 'border-[#FDBA74] bg-[#171717] text-[#FDBA74] ring-2 ring-[#FDBA74]/50 ring-offset-2 ring-offset-[#0A0A0A]';
          }

          return (
            <button
              key={order}
              type="button"
              disabled={locked}
              onClick={() => onJump(order)}
              className={`h-9 rounded-lg border text-sm font-semibold transition ${cls} ${locked ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              {order}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[#A3A3A3]">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[#FDBA74]" /> Answered
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[3px] border border-[#262626] bg-[#171717]" /> Unanswered
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[3px] border border-[#FDBA74] ring-1 ring-[#FDBA74]" /> Current
        </span>
      </div>
    </div>
  );
}
