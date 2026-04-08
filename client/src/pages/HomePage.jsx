import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Speed training',
    description: 'Short sessions designed to build your words-per-minute consistently.',
  },
  {
    title: 'Accuracy focus',
    description: 'Learn to type with fewer mistakes and maintain a clean streak.',
  },
  {
    title: 'Performance tracking',
    description: 'See your progress over time with clear metrics and charts.',
  },
];

const stats = [
  { label: 'Top speed', value: '182 WPM' },
  { label: 'Best accuracy', value: '99%' },
  { label: 'Daily streak', value: '7 days' },
  { label: 'Races won', value: '24' },
];

export default function HomePage() {
  return (
    <>
      <section className="page-hero">
        <div className="hero-copy">
          <p className="eyebrow">Premium typing, redesigned</p>
          <h1>Master typing with precision, speed, and confidence.</h1>
          <p className="hero-subtitle">
            TypeZone combines live metrics, elegant practice routines, and a focused modern experience so you can improve every day.
          </p>
          <div className="hero-actions">
            <Link to="/typing" className="btn btn-primary">
              Start typing
            </Link>
            <Link to="/practice" className="btn btn-secondary">
              Practice drills
            </Link>
          </div>
        </div>

        <div className="hero-panel glass-panel">
          <div className="hero-panel-tag">Live performance snapshot</div>
          <div className="hero-panel-grid">
            <div>
              <p className="stat-label">Speed</p>
              <p className="stat-value">176 WPM</p>
            </div>
            <div>
              <p className="stat-label">Accuracy</p>
              <p className="stat-value">98%</p>
            </div>
            <div>
              <p className="stat-label">Focus</p>
              <p className="stat-value">6m 23s</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="section-header">
          <p className="eyebrow">Why TypeZone</p>
          <h2>Built for serious typists and fast learners.</h2>
          <p className="section-subtitle">
            Clean layout, meaningful feedback, and modern theme options keep you engaged without distractions.
          </p>
        </div>

        <div className="card-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card glass-panel">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-header">
          <p className="eyebrow">Stats</p>
          <h2>Performance that feels premium.</h2>
        </div>

        <div className="stats-grid">
          {stats.map((item) => (
            <div key={item.label} className="metric-card glass-panel">
              <span className="metric-label">{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
