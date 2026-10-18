export default function TeamBadge({ team }) {
  if (!team) return null;
  const num = String(team.teamNumber).padStart(2, '0');
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-500/10 font-mono text-lg font-bold text-indigo-300">
        {num}
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-white">Team {team.teamNumber}</div>
        <div className="max-w-[14rem] truncate text-xs text-slate-400">
          {team.member1Name} <span className="text-slate-600">·</span> {team.member2Name}
        </div>
      </div>
    </div>
  );
}
