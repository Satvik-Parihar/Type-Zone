import { Link } from 'react-router-dom';

const drills = [
  { title: 'Speed Sprint', description: 'A short, high-intensity practice to improve your raw words per minute.' },
  { title: 'Accuracy Focus', description: 'Work on precision with slower, low-error typing drills.' },
  { title: 'Sentence Flow', description: 'Practice natural typing with realistic sentence prompts.' },
];

export default function PracticePage() {
  return (
    <section className="page-section">
      <div className="section-header">
        <p className="eyebrow">Practice</p>
        <h1>Sharpen your typing with focused drills.</h1>
        <p className="section-subtitle">
          Select a practice mode that matches your goal and build steady improvement with every session.
        </p>
      </div>

      <div className="card-grid">
        {drills.map((drill) => (
          <article key={drill.title} className="feature-card glass-panel">
            <h2>{drill.title}</h2>
            <p>{drill.description}</p>
          </article>
        ))}
      </div>

      <div className="cta-row">
        <Link to="/typing" className="btn btn-primary">
          Start a new drill
        </Link>
      </div>
    </section>
  );
}
