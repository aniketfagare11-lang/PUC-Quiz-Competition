export default function QuestionPalette({
  total,
  answersByOrder = {},
  currentOrder,
  onJump,
  flaggedByOrder = {},
  locked = false,
}) {
  const answeredCount = Object.values(answersByOrder).filter(Boolean).length;

  return (
    <div className="card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#FDBA74]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <h3 className="text-sm font-semibold text-white">Question Palette</h3>
        </div>
        <span className="rounded-md border border-[#333333] bg-[#0A0A0A] px-2.5 py-0.5 text-xs font-semibold text-[#A3A3A3]">
          {answeredCount}/{total} answered
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2 sm:grid-cols-5">
        {Array.from({ length: total }, (_, i) => {
          const order = i + 1;
          const answered = !!answersByOrder[order];
          const isCurrent = order === currentOrder;
          const isFlagged = !!flaggedByOrder[order];

          let btnClass = 'border-[#333333] bg-[#141414] text-[#A3A3A3] hover:border-[#4B4B4B] hover:text-white hover:bg-[#1E1E1E]';
          if (answered) {
            btnClass = 'border-transparent bg-[#FDBA74] text-[#0A0A0A] font-bold hover:bg-[#FED7AA]';
          }
          if (isCurrent) {
            btnClass = answered
              ? 'border-transparent bg-[#FDBA74] text-[#0A0A0A] font-extrabold ring-2 ring-[#FDBA74] ring-offset-2 ring-offset-[#0A0A0A]'
              : 'border-[#FDBA74] bg-[#1A1815] text-[#FDBA74] font-bold ring-2 ring-[#FDBA74]/50 ring-offset-2 ring-offset-[#0A0A0A]';
          }

          return (
            <button
              key={order}
              type="button"
              disabled={locked}
              onClick={() => onJump(order)}
              className={`relative flex h-9.5 items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-150 ${btnClass} ${
                locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:scale-95'
              }`}
              title={`Question ${order}${answered ? ' (Answered)' : ''}${isCurrent ? ' (Current)' : ''}${isFlagged ? ' (Flagged)' : ''}`}
            >
              {order}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] text-[#0A0A0A] font-bold shadow-sm ring-1 ring-[#0A0A0A]">
                  ★
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* State Legend */}
      <div className="mt-4 border-t border-[#262626] pt-3.5 grid grid-cols-2 gap-x-2 gap-y-2 text-[11px] text-[#A3A3A3]">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[#FDBA74]" /> Answered
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[3px] border border-[#333333] bg-[#141414]" /> Unanswered
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-2.5 w-2.5 rounded-[3px] border border-[#FDBA74] ring-1 ring-[#FDBA74]" /> Current
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-400 text-[7px] text-[#0A0A0A] font-bold">★</span> Flagged
        </span>
      </div>
    </div>
  );
}
