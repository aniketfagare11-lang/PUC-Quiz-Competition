export default function AutosaveStatus({ state = 'idle' }) {
  // state: 'idle' | 'saving' | 'saved' | 'error'

  const config = {
    saving: {
      badgeText: 'Saving…',
      badgeClass: 'border-[#FDBA74]/40 bg-[#FDBA74]/10 text-[#FDBA74]',
      desc: 'Syncing your selection with the quiz server…',
      icon: (
        <svg className="h-4 w-4 animate-spin text-[#FDBA74]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ),
    },
    saved: {
      badgeText: 'Saved',
      badgeClass: 'border-emerald-800/40 bg-emerald-950/20 text-emerald-400',
      desc: 'All responses saved securely.',
      icon: (
        <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    error: {
      badgeText: 'Save Failed',
      badgeClass: 'border-rose-800/40 bg-rose-950/20 text-rose-400',
      desc: 'Failed to save. Retrying on next change.',
      icon: (
        <svg className="h-4 w-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    idle: {
      badgeText: 'Active',
      badgeClass: 'border-[#333333] bg-[#0A0A0A] text-[#A3A3A3]',
      desc: 'Continuous autosave enabled. Responses save immediately on selection.',
      icon: (
        <svg className="h-4 w-4 text-[#FDBA74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
          <polyline points="13 11 9 15 7 13" />
        </svg>
      ),
    },
  };

  const current = config[state] || config.idle;

  return (
    <div className="card p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <div className="flex h-5 w-5 items-center justify-center">
            {current.icon}
          </div>
          <span>Autosave Status</span>
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${current.badgeClass}`}>
          {current.badgeText}
        </span>
      </div>
      <p className="text-xs text-[#A3A3A3] leading-relaxed">
        {current.desc}
      </p>
    </div>
  );
}
