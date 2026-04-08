export default function LeaderboardPage() {
  const leaders = [
    { name: 'Avery', wpm: 182, accuracy: 99 },
    { name: 'Noah', wpm: 176, accuracy: 98 },
    { name: 'Mila', wpm: 170, accuracy: 97 },
    { name: 'Leo', wpm: 165, accuracy: 96 },
    { name: 'Zara', wpm: 158, accuracy: 95 },
  ];

  return (
    <section className="page-section">
      <div className="section-header">
        <p className="eyebrow">Leaderboard</p>
        <h1>The fastest typists in the zone.</h1>
        <p className="section-subtitle">
          Track your rank, compare top scores, and find the motivation to keep improving.
        </p>
      </div>

      <div className="leaderboard-card glass-panel">
        <div className="leaderboard-table">
          <div className="leaderboard-row leaderboard-header">
            <span>Rank</span>
            <span>Player</span>
            <span>WPM</span>
            <span>Accuracy</span>
          </div>
          {leaders.map((entry, index) => (
            <div key={entry.name} className="leaderboard-row">
              <span>#{index + 1}</span>
              <span>{entry.name}</span>
              <span>{entry.wpm}</span>
              <span>{entry.accuracy}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
