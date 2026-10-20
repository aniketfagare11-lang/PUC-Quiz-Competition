export default function Logo({ size = 'md' }) {
  const title = size === 'lg' ? 'text-2xl sm:text-4xl' : 'text-lg sm:text-xl';
  const mark = size === 'lg' ? 'h-10 w-10 sm:h-11 sm:w-11' : 'h-8 w-8 sm:h-9 sm:w-9';
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div className={`${mark} shrink-0 rounded-xl bg-[#171717] border border-[#333333] p-1 shadow-sm flex items-center justify-center`}>
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
          Quiz Time
        </div>
      </div>
    </div>
  );
}
