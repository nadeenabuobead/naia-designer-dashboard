cat > app/page.tsx << 'EOF'
'use client';

import { useEffect, useState } from 'react';

export default function DesignerDashboard() {
  const [data, setData] = useState<any>(null);
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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-red-600">Failed to load dashboard</p>
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
          <div className="bg-stone-200 p-6 rounded text-center">
            <p className="text-3xl italic mb-2 text-stone-900">{data.totalUsers}</p>
            <p className="text-xs uppercase tracking-wider text-stone-600">Total Users</p>
          </div>
          <div className="bg-stone-200 p-6 rounded text-center">
            <p className="text-3xl italic mb-2 text-stone-900">{data.totalReviews}</p>
            <p className="text-xs uppercase tracking-wider text-stone-600">Total Ratings</p>
          </div>
          <div className="bg-stone-200 p-6 rounded text-center">
            <p className="text-3xl italic mb-2 text-stone-900">{data.avgFeeling}/5</p>
            <p className="text-xs uppercase tracking-wider text-stone-600">Avg Rating</p>
          </div>
          <div className="bg-stone-200 p-6 rounded text-center">
            <p className="text-3xl italic mb-2 text-stone-900">{data.feltLikeMePercent}%</p>
            <p className="text-xs uppercase tracking-wider text-stone-600">Style Alignment</p>
          </div>
          <div className="bg-stone-200 p-6 rounded text-center">
            <p className="text-3xl italic mb-2 text-stone-900">{data.wouldWearPercent}%</p>
            <p className="text-xs uppercase tracking-wider text-stone-600">Would Wear Again</p>
          </div>
        </div>

        {/* What Works */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-4">What Consistently Works</h2>
          <div className="grid grid-cols-2 gap-3">
            {data.topWorked?.map((item: any) => (
              <div key={item.tag} className="bg-stone-100 p-3 rounded">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-stone-900">{item.tag}</span>
                  <span className="text-xs text-stone-500">from {item.count} look{item.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What Doesn't Work */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-4">What Doesn't Work</h2>
          <div className="grid grid-cols-2 gap-3">
            {data.topDidntWork?.map((item: any) => (
              <div key={item.tag} className="bg-stone-100 p-3 rounded">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-stone-900">{item.tag}</span>
                  <span className="text-xs text-stone-500">from {item.count} look{item.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emotional Shifts */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-4">Best Emotional Shifts</h2>
          <div className="flex flex-wrap gap-3">
            {data.topShifts?.map((shift: any) => (
              <div 
                key={shift.name} 
                className={`px-5 py-3 rounded text-sm italic ${
                  shift.count === 1 ? 'bg-stone-300 text-stone-600' : 'bg-stone-900 text-stone-50'
                }`}
              >
                {shift.name} 
                <span className="text-xs opacity-70">
                  ({shift.avg}/5 • from {shift.count} look{shift.count !== 1 ? 's' : ''})
                  {shift.count === 1 && ' • low sample'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Occasions */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-4">Best Occasions</h2>
          <div className="flex flex-wrap gap-3">
            {data.topOccasions?.map((occasion: any, idx: number) => (
              <div 
                key={occasion.name} 
                className={`px-5 py-3 rounded text-sm ${
                  occasion.count === 1 ? 'bg-stone-200 text-stone-500' :
                  idx === 0 ? 'bg-stone-900 text-stone-50' : 'bg-stone-200 text-stone-900'
                }`}
              >
                {occasion.name} 
                <span className="text-xs opacity-70">
                  ({occasion.avg}/5 • from {occasion.count} look{occasion.count !== 1 ? 's' : ''})
                  {occasion.count === 1 && ' • emerging'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User Quotes */}
        {data.quotes?.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-widest text-stone-500 mb-4">What Stood Out To Users</h2>
            <div className="space-y-3">
              {data.quotes.map((quote: string, i: number) => (
                <div key={i} className="pl-4 border-l border-stone-300 py-2">
                  <p className="text-stone-700 italic">"{quote}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
EOF