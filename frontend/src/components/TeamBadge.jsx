export default function TeamBadge({ team }) {
  if (!team) return null;
  const num = String(team.teamNumber || 1).padStart(2, '0');
  const members = Array.isArray(team.participants) && team.participants.length
    ? team.participants.filter(Boolean).join(' · ')
    : [team.member1Name, team.member2Name].filter(Boolean).join(' · ');

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FDBA74]/30 bg-[#FDBA74]/10 font-mono text-base font-bold text-[#FDBA74]">
        {num}
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-white">Team {team.teamNumber}</div>
        {members ? (
          <div className="max-w-[14rem] truncate text-xs text-[#A3A3A3]" title={members}>
            {members}
          </div>
        ) : null}
      </div>
    </div>
  );
}
