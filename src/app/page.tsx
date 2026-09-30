'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWorks } from '@/lib/api/works';
import { getCompetitions } from '@/lib/api/competitions';
import { WorkCard } from '@/components/works/WorkCard';
import { CompetitionStatusBadge } from '@/components/ui/Badge';
import type { Competition, Work } from '@/types/api';
import { formatDate } from '@/lib/utils';

export default function HomePage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getWorks(), getCompetitions()])
      .then(([nextWorks, nextCompetitions]) => {
        setWorks(nextWorks);
        setCompetitions(nextCompetitions);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری ناموفق بود'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto mt-20 max-w-6xl px-4 py-10">
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">آثار خلاقانه را کشف کنید</h1>
        <p className="mt-3 text-lg text-zinc-500">مرور، اشتراک‌گذاری و شرکت در مسابقات داستان</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/works"
            className="inline-flex rounded-lg bg-taupe-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-taupe-700">
            مشاهده آثار
          </Link>
          <Link
            href="/competitions"
            className="inline-flex rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
            مسابقات
          </Link>
        </div>
      </section>

      {loading && <p className="text-center text-zinc-500">در حال بارگذاری...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && competitions.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">مسابقات جاری</h2>
            <Link
              href="/competitions"
              className="text-sm text-taupe-800 hover:underline">
              همه مسابقات
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {competitions.slice(0, 4).map(competition => (
              <Link
                key={competition.id}
                href={`/competitions/${competition.id}`}
                className="rounded-xl bg-white p-5 transition-shadow hover:shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-zinc-900">{competition.name}</h3>
                  <CompetitionStatusBadge status={competition.status} />
                </div>
                <p className="line-clamp-2 text-sm text-zinc-600">{competition.description}</p>
                <p className="mt-3 text-xs text-zinc-400">مهلت: {formatDate(competition.applicationDeadline)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

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

      {!loading && works.length === 0 && !error && (
        <p className="text-center text-zinc-500">هنوز اثری تأیید نشده است. اولین نفری باشید که به اشتراک می‌گذارد!</p>
      )}
    </div>
  );
}
