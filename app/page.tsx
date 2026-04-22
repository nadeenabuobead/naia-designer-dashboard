'use client';

interface TagBarProps {
  tag: string;
  count: number;
  total: number;
  color: string;
}


import { useEffect, useState } from 'react';

export default function DesignerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-500 italic">Loading designer insights...</p>
      </div>
    );
  }

  if (!data || (data as any).error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-red-600">Failed to load dashboard: {(data as any)?.error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-light tracking-wider uppercase text-stone-900 mb-2">Designer Dashboard</h1>
        <p className="text-stone-500 italic mb-12">Aggregate insights across all nAia users</p>

        {/* Top Metrics */}
        <div className="grid grid-cols-5 gap-4 mb-12">
          <MetricCard number={data.totalUsers} label="Total Users" />
          <MetricCard number={data.totalReviews} label="Total Ratings" />
          <MetricCard number={`${data.avgFeeling}/5`} label="Avg Rating" />
          <MetricCard number={`${data.feltLikeMePercent}%`} label="Style Alignment" />
          <MetricCard number={`${data.wouldWearPercent}%`} label="Would Wear Again" />
        </div>

        {/* What Works */}
        <Section title="What Consistently Works" subtitle="Most selected positive feedback tags">
          <div className="grid grid-cols-2 gap-3">
            {data.topWorked.map(({ tag, count }) => (
              <TagBar key={tag} tag={tag} count={count} total={data.totalReviews} color="bg-green-600" />
            ))}
          </div>
        </Section>

        {/* What Doesn't Work */}
        <Section title="What Doesn't Work" subtitle="Most selected negative feedback tags">
          <div className="grid grid-cols-2 gap-3">
            {data.topDidntWork.map(({ tag, count }) => (
              <TagBar key={tag} tag={tag} count={count} total={data.totalReviews} color="bg-red-600" />
            ))}
          </div>
        </Section>

        {/* Emotional Shifts */}
        <Section title="Best Emotional Shifts" subtitle="Transformations with highest ratings">
          <div className="flex flex-wrap gap-3">
            {data.topShifts.map(({ name, avg, count }) => (
              <div key={name} className="px-5 py-3 bg-stone-900 text-stone-50 rounded text-sm italic">
                {name} <span className="text-xs text-stone-500 font-semibold">{count}x ({percentage}%)</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Best Occasions */}
        <Section title="Best Occasions" subtitle="Events with highest success rates">
          <div className="flex flex-wrap gap-3">
            {data.topOccasions.map(({ name, avg, count }, idx) => (
              <div 
                key={name} 
                className={`px-5 py-3 rounded text-sm ${
                  idx === 0 ? 'bg-stone-900 text-stone-50 font-medium' : 'bg-stone-200 text-stone-900'
                }`}
              >
                {name} <span className="text-xs opacity-70">({avg}/5 • {count}x)</span>
              </div>
            ))}
          </div>
        </Section>

        {/* User Quotes */}
        {data.quotes.length > 0 && (
          <Section title="What Stood Out To Users" subtitle="In their own words">
            <div className="space-y-3">
              {data.quotes.map((quote, i) => (
                <div key={i} className="pl-4 border-l border-stone-300 py-2">
                  <p className="text-stone-700 italic">"{quote}"</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function MetricCard({ number, label }) {
  return (
    <div className="bg-stone-200 p-6 rounded text-center">
      <p className="text-3xl italic mb-2 text-stone-900">{number}</p>
      <p className="text-xs uppercase tracking-wider text-stone-600">{label}</p>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="mb-12">
      <div className="mb-4">
        <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-1">{title}</h2>
        <p className="text-sm text-stone-500 italic">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function TagBar({ tag, count, total, color }: TagBarProps) {
  const percentage = Math.round((count / total) * 100);
  
  return (
    <div className="bg-stone-100 p-3 rounded">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-stone-900">{tag}</span>
        <span className="text-xs text-stone-500">{count} ({percentage}%)</span>
      </div>
      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}