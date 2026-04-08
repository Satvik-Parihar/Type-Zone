import { Link } from 'react-router-dom';

export default function MultiplayerPage() {
  return (
    <section className="page-section">
      <div className="section-header">
        <p className="eyebrow">Multiplayer</p>
        <h1>Join live typing races with other players.</h1>
        <p className="section-subtitle">
          Create a room, invite a teammate, or jump into a shared race lane. Real competition, simple setup.
        </p>
      </div>

      <div className="card-grid">
        <article className="feature-card glass-panel">
          <h2>Quick Match</h2>
          <p>Start a new race room and invite friends instantly.</p>
        </article>

        <article className="feature-card glass-panel">
          <h2>Live Leaderboard</h2>
          <p>Compare speed and accuracy across every round.</p>
        </article>

        <article className="feature-card glass-panel">
          <h2>Practice Before Racing</h2>
          <p>Warm up in practice mode and return stronger to the race.</p>
        </article>
      </div>

      <div className="cta-row">
        <Link to="/typing" className="btn btn-primary">
          Warm up with a typing test
        </Link>
        <Link to="/practice" className="btn btn-secondary">
          Browse practice drills
        </Link>
      </div>
    </section>
  );
}
