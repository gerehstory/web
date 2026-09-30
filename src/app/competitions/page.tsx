'use client';

import { useEffect, useState } from 'react';
import { getCompetitions } from '@/lib/api/competitions';
import { CompetitionCard } from '@/components/competitions/CompetitionCard';
import type { Competition } from '@/types/api';

export default function CompetitionsPage() {
  const [items, setItems] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCompetitions()
      .then(setItems)
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری ناموفق بود'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto mt-20 max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-zinc-900">مسابقات</h1>
      {loading && <p className="text-zinc-500">در حال بارگذاری...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(item => (
            <CompetitionCard
              key={item.id}
              competition={item}
            />
          ))}
        </div>
      )}
      {!loading && items.length === 0 && !error && <p className="text-zinc-500">مسابقه‌ای یافت نشد.</p>}
    </div>
  );
}
