import { memo } from 'react';

function RaceRoomPanel({ raceWinner, racePlayers }) {
  return (
    <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-200">Race Room</h3>
      {raceWinner
        ? <p className="mb-2 text-emerald-400">Winner: {raceWinner}</p>
        : <p className="mb-2 text-slate-400">No winner yet</p>}
      <ul className="space-y-2 text-sm text-slate-300">
        {racePlayers.map((player, idx) => (
          <li key={`${player.username}-${idx}`}>
            <div className="mb-1 flex justify-between">
              <span>{player.rank ? `#${player.rank} ` : ''}{player.username}</span>
              <span>{player.progress}% ({player.wpm} wpm)</span>
            </div>
            <div className="h-1.5 w-full rounded bg-slate-800">
              <div className="h-1.5 rounded bg-sky-500 transition-all" style={{ width: `${player.progress}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default memo(RaceRoomPanel);
