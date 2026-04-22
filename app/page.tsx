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
        <p className="text-stone-500 italic mb-12">Which styles are working, how they make users feel, and what to design next</p>

        {/* Top Metrics */}
        <div className="grid grid-cols-5 gap-4 mb-16">
          <div className="bg-stone-200 p-6 rounded text-center">
            <p className="text-3xl italic mb-2 text-stone-900">{data.totalUsers}</p>
            <p className="text-xs uppercase tracking-wider text-stone-600">Total Users</p>
          </div>
          <div className="bg-stone-200 p-6 rounded text-center">
            <p className="text-3xl italic mb-2 text-stone-900">{data.totalReviews}</p>
            <p className="text-xs uppercase tracking-wider text-stone-600">Looks Rated</p>
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

        {/* 1. What Styles Are Landing */}
        <Section title="What Styles Are Landing" subtitle="Most successful outfit qualities across users">
          <div className="grid grid-cols-2 gap-3">
            {data.topWorked?.map((item: any) => (
              <div key={item.tag} className="bg-white p-4 rounded border border-stone-200">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-medium text-stone-900">{item.tag}</span>
                  <span className="text-xs text-stone-400">{item.count} look{item.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 2. What These Styles Help Users Feel */}
        <Section title="What These Styles Help Users Feel" subtitle="Emotional outcomes associated with successful looks">
          <div className="grid grid-cols-2 gap-4">
            {data.topShifts?.filter((s: any) => s.count > 1).slice(0, 6).map((shift: any) => (
              <div key={shift.name} className="bg-white p-5 rounded border border-stone-200">
                <div className="text-base font-medium text-stone-900 mb-2">{shift.name}</div>
                <div className="text-sm text-stone-600 mb-3">
                  Avg {shift.avg}/5 · {shift.count} look{shift.count !== 1 ? 's' : ''}
                </div>
                {shift.topTags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {shift.topTags.map((tag: string) => (
                      <span key={tag} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* 3. What Users Liked Most */}
        <Section title="What Users Liked Most" subtitle="Most selected positive feedback tags">
          <div className="grid grid-cols-3 gap-3">
            {data.topWorked?.slice(0, 6).map((item: any) => (
              <div key={item.tag} className="bg-stone-100 p-3 rounded">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-stone-900">{item.tag}</span>
                  <span className="text-xs text-stone-500">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. What's Not Landing */}
        <Section title="What's Not Landing" subtitle="Most selected rejection points">
          <div className="grid grid-cols-3 gap-3">
            {data.topDidntWork?.slice(0, 6).map((item: any) => (
              <div key={item.tag} className="bg-red-50 border border-red-100 p-3 rounded">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-red-900">{item.tag}</span>
                  <span className="text-xs text-red-600">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 5. Body and Fit Patterns */}
        {data.topBodyPrefs?.length > 0 && (
          <Section title="Body and Fit Patterns" subtitle="Recurring body preferences and comfort needs">
            <div className="grid grid-cols-2 gap-3">
              {data.topBodyPrefs.map((pref: any) => (
                <div key={pref.pref} className="bg-white p-4 rounded border border-stone-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-stone-900">{pref.pref}</span>
                    <span className="text-xs text-stone-400">{pref.count} request{pref.count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 6. What Users Need Help Styling */}
        <Section title="What Users Need Help Styling" subtitle="Most requested occasions and styling contexts">
          <div className="grid grid-cols-4 gap-3">
            {data.topOccasions?.map((occasion: any, idx: number) => (
              <div 
                key={occasion.name} 
                className={`p-4 rounded ${
                  occasion.count === 1 ? 'bg-stone-100 border border-stone-200' :
                  idx === 0 ? 'bg-stone-900 text-stone-50' : 'bg-white border border-stone-200'
                }`}
              >
                <div className={`text-sm font-medium mb-1 capitalize ${idx === 0 && occasion.count > 1 ? 'text-stone-50' : 'text-stone-900'}`}>
                  {occasion.name}
                </div>
                <div className={`text-xs ${idx === 0 && occasion.count > 1 ? 'text-stone-300' : 'text-stone-500'}`}>
                  {occasion.avg}/5 · {occasion.count} look{occasion.count !== 1 ? 's' : ''}
                  {occasion.count === 1 && <span className="ml-1 opacity-60">• emerging</span>}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 7. In Their Own Words */}
        {data.quotes?.length > 0 && (
          <Section title="In Their Own Words" subtitle="Qualitative feedback from users">
            <div className="space-y-3">
              {data.quotes.map((quote: string, i: number) => (
                <div key={i} className="pl-4 border-l-2 border-stone-300 py-2">
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

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mb-16">
      <div className="mb-5">
        <h2 className="text-sm uppercase tracking-widest text-stone-900 mb-1 font-medium">{title}</h2>
        <p className="text-sm text-stone-500 italic">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}