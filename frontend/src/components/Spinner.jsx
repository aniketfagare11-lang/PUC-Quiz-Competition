export default function Spinner({ label = 'Loading…', full = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
      <svg className="h-8 w-8 animate-spin text-indigo-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  if (full) {
    return <div className="flex min-h-[60vh] items-center justify-center">{content}</div>;
  }
  return content;
}
