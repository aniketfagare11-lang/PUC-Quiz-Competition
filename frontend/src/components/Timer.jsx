function format(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function Timer({ remainingMs, compact = false }) {
  const low = remainingMs <= 60_000;
  const warn = remainingMs <= 180_000 && !low;

  const textColor = low ? 'text-rose-400' : warn ? 'text-amber-300' : 'text-emerald-300';
  const surface = low
    ? 'border-rose-500/40 bg-rose-500/10'
    : warn
    ? 'border-amber-500/30 bg-amber-500/10'
    : 'border-slate-700 bg-slate-900/60';

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-2 ${surface}`}>
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${textColor}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2M9 2h6" />
      </svg>
      <div className="leading-none">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Time Left</div>
        <div className={`font-mono font-bold tabular-nums ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'} ${textColor} ${low ? 'animate-pulse' : ''}`}>
          {format(remainingMs)}
        </div>
      </div>
    </div>
  );
}
