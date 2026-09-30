'use client';

import { useEffect, useState } from 'react';
import { getWorks } from '@/lib/api/works';
import { WorkCard } from '@/components/works/WorkCard';
import type { Work } from '@/types/api';

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getWorks()
      .then(setWorks)
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری آثار ناموفق بود'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto mt-20 max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">همه آثار</h1>
        <p className="mt-2 text-sm text-zinc-500">فقط نسخه‌های منتشرشده نمایش داده می‌شوند.</p>
      </div>

      {loading && <p className="text-zinc-500">در حال بارگذاری...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {works.map(work => (
            <WorkCard
              key={work.id}
              work={work}
            />
          ))}
        </div>
      )}

      {!loading && works.length === 0 && !error && <p className="text-center text-zinc-500">اثری یافت نشد.</p>}
    </div>
  );
}
