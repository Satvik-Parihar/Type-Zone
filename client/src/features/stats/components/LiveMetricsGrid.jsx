import { memo } from 'react';

function MetricCard({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <h2 className="text-2xl font-semibold">{value}</h2>
    </article>
  );
}

function LiveMetricsGrid({ metrics, timer }) {
  return (
    <section className="mb-4 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
      <MetricCard label="Live WPM" value={metrics.wpm} />
      <MetricCard label="Raw WPM" value={metrics.rawWpm} />
      <MetricCard label="Accuracy" value={`${metrics.accuracy}%`} />
      <MetricCard label="Errors" value={metrics.errorCount} />
      <MetricCard label="Consistency" value={`${metrics.consistency}%`} />
      <MetricCard label="KPS" value={metrics.keystrokesPerSecond} />
      <MetricCard label="Timer" value={timer === null ? 'Zen' : `${timer}s`} />
      <MetricCard label="Engine" value="Low Latency" />
    </section>
  );
}

export default memo(LiveMetricsGrid);
