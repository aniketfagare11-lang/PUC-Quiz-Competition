export default function Logo({ size = 'md', subtitle = true }) {
  const title = size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-xl';
  const mark = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  return (
    <div className="flex items-center gap-3">
      <div className={`${mark} shrink-0 rounded-xl bg-[#171717] border border-[#262626] p-1 shadow-sm flex items-center justify-center`}>
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#0A0A0A] text-[#FDBA74]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3a4 4 0 0 0-2 7.5A3.5 3.5 0 0 0 7 17v2a2 2 0 0 0 2 2" />
            <path d="M15 3a4 4 0 0 1 2 7.5A3.5 3.5 0 0 1 17 17v2a2 2 0 0 1-2 2" />
            <path d="M9 8h.01M15 8h.01" />
          </svg>
        </div>
      </div>
      <div className="leading-tight">
        <div className={`${title} font-extrabold tracking-tight text-white`}>
          AI Quiz <span className="text-[#FDBA74]">Time</span>
        </div>
        {subtitle && <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A3A3A3]">College Competition</div>}
      </div>
    </div>
  );
}
