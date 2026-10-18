export default function Logo({ size = 'md', subtitle = true }) {
  const title = size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-xl';
  const mark = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  return (
    <div className="flex items-center gap-3">
      <div className={`${mark} shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-[2px] shadow-lg shadow-indigo-950/50`}>
        <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950/70">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="url(#lg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" /><stop offset="1" stopColor="#e879f9" />
              </linearGradient>
            </defs>
            <path d="M9 3a4 4 0 0 0-2 7.5A3.5 3.5 0 0 0 7 17v2a2 2 0 0 0 2 2" />
            <path d="M15 3a4 4 0 0 1 2 7.5A3.5 3.5 0 0 1 17 17v2a2 2 0 0 1-2 2" />
            <path d="M9 8h.01M15 8h.01" />
          </svg>
        </div>
      </div>
      <div className="leading-tight">
        <div className={`${title} font-extrabold tracking-tight text-white`}>
          AI Quiz <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">Time</span>
        </div>
        {subtitle && <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">College Tech Competition</div>}
      </div>
    </div>
  );
}
