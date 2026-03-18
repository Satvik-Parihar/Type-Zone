import { memo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function PerformanceTrendChart({ data }) {
  return (
    <article className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4 lg:col-span-2">
      <h3 className="mb-2 text-sm font-semibold text-slate-200">Performance Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="wpm" stroke="#38bdf8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="consistency" stroke="#f97316" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default memo(PerformanceTrendChart);
