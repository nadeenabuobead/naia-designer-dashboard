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
        <p className="text-stone-500 italic mb-12">Which pieces are landing, for whom, and why</p>

        {/* Top Metrics */}
        <div className="grid grid-cols-5 gap-4 mb-16">
          <MetricCard number={data.totalUsers} label="Total Users" />
          <MetricCard number={data.totalReviews} label="Looks Rated" />
          <MetricCard number={`${data.avgFeeling}/5`} label="Avg Rating" />
          <MetricCard number={`${data.feltLikeMePercent}%`} label="Style Alignment" />
          <MetricCard number={`${data.wouldWearPercent}%`} label="Would Wear Again" />
        </div>

        {/* Top Performing Pieces */}
        <Section title="Top-Performing Pieces" subtitle="Garments from your collection with highest ratings">
          {data.topPieces?.length > 0 ? (
            <div className="space-y-4">
              {data.topPieces.map((piece: any) => (
                <PieceCard key={piece.name} piece={piece} variant="success" />
              ))}
            </div>
          ) : (
            <p className="text-stone-500 italic">Not enough data yet</p>
          )}
        </Section>

        {/* Struggling Pieces */}
        {data.strugglingPieces?.length > 0 && (
          <Section title="Pieces That Need Attention" subtitle="Garments with lower ratings or frequent rejection">
            <div className="space-y-4">
              {data.strugglingPieces.map((piece: any) => (
                <PieceCard key={piece.name} piece={piece} variant="warning" />
              ))}
            </div>
          </Section>
        )}

        {/* What Users Liked Most */}
        <Section title="What Users Liked Most" subtitle="Most selected positive feedback across all looks">
          <div className="grid grid-cols-3 gap-3">
            {data.topWorkedOverall?.map((item: any) => (
              <div key={item.tag} className="bg-white p-4 rounded border border-stone-200">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-stone-900">{item.tag}</span>
                  <span className="text-xs text-stone-400">{item.count} look{item.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* What Didn't Work */}
        <Section title="What Didn't Work" subtitle="Most common rejection points">
          <div className="grid grid-cols-3 gap-3">
            {data.topDidntWorkOverall?.map((item: any) => (
              <div key={item.tag} className="bg-red-50 border border-red-100 p-4 rounded">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-red-900">{item.tag}</span>
                  <span className="text-xs text-red-600">{item.count} look{item.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Body Preference Patterns */}
        {data.topBodyPrefsOverall?.length > 0 && (
          <Section title="Body Preference Patterns" subtitle="What customers are asking for physically">
            <div className="grid grid-cols-3 gap-3">
              {data.topBodyPrefsOverall.map((pref: any) => (
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

        {/* What Users Need Help Styling */}
        <Section title="What Users Need Help Styling" subtitle="Most requested occasions">
          <div className="grid grid-cols-4 gap-3">
            {data.topOccasionsOverall?.map((occ: any, idx: number) => (
              <div 
                key={occ.occasion} 
                className={`p-4 rounded ${idx === 0 ? 'bg-stone-900 text-stone-50' : 'bg-white border border-stone-200'}`}
              >
                <div className={`text-sm font-medium mb-1 capitalize ${idx === 0 ? 'text-stone-50' : 'text-stone-900'}`}>
                  {occ.occasion}
                </div>
                <div className={`text-xs ${idx === 0 ? 'text-stone-300' : 'text-stone-500'}`}>
                  {occ.count} look{occ.count !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function PieceCard({ piece, variant }: { piece: any; variant: 'success' | 'warning' }) {
  const borderColor = variant === 'success' ? 'border-green-200' : 'border-orange-200';
  const bgColor = variant === 'success' ? 'bg-green-50' : 'bg-orange-50';
  
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-5`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-stone-900">{piece.name}</h3>
          <p className="text-sm text-stone-500 capitalize">{piece.category}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-light text-stone-900">{piece.avgRating}/5</div>
          <div className="text-xs text-stone-500">{piece.timesRated} rating{piece.timesRated !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Recommended</div>
          <div className="text-sm font-medium text-stone-900">{piece.timesRecommended} time{piece.timesRecommended !== 1 ? 's' : ''}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Would Wear Again</div>
          <div className="text-sm font-medium text-stone-900">{piece.wouldWearPercent}%</div>
        </div>
      </div>

      {/* What Worked */}
      {piece.topWorked?.length > 0 && (
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-stone-500 mb-2">What Worked</div>
          <div className="flex flex-wrap gap-2">
            {piece.topWorked.map((tag: string) => (
              <span key={tag} className="text-xs bg-white border border-stone-200 text-stone-700 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* What Didn't Work */}
      {piece.topDidntWork?.length > 0 && (
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-stone-500 mb-2">Watchouts</div>
          <div className="flex flex-wrap gap-2">
            {piece.topDidntWork.map((tag: string) => (
              <span key={tag} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Context Grid */}
      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-stone-200">
        {/* Feelings Created */}
        {piece.topFeelings?.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Helped Users Feel</div>
            <div className="text-xs text-stone-700">
              {piece.topFeelings.join(', ')}
            </div>
          </div>
        )}

        {/* Best Occasions */}
        {piece.topOccasions?.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Best For</div>
            <div className="text-xs text-stone-700 capitalize">
              {piece.topOccasions.join(', ')}
            </div>
          </div>
        )}

        {/* Body Preferences */}
        {piece.topBodyPrefs?.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Body Match</div>
            <div className="text-xs text-stone-700">
              {piece.topBodyPrefs.join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* Quote */}
      {piece.quote && (
        <div className="mt-4 pt-3 border-t border-stone-200">
          <p className="text-sm text-stone-600 italic">"{piece.quote}"</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ number, label }: { number: any; label: string }) {
  return (
    <div className="bg-stone-200 p-6 rounded text-center">
      <p className="text-3xl italic mb-2 text-stone-900">{number}</p>
      <p className="text-xs uppercase tracking-wider text-stone-600">{label}</p>
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