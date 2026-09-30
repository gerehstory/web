'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getJudgeEntries } from '@/lib/api/competitions';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { Badge, CompetitionStatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/utils';
import type { JudgeEntriesResponse } from '@/types/api';

export default function JudgeEntriesPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { ready } = useRequireAuth();
  const [data, setData] = useState<JudgeEntriesResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    getJudgeEntries(id)
      .then(setData)
      .catch(err => setError(err instanceof Error ? err.message : 'دسترسی داوری ممکن نیست'))
      .finally(() => setLoading(false));
  }, [ready, id]);

  if (!ready || loading) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const { competition, entries } = data;
  const scoring = competition.status === 'second_round' || competition.status === 'tie_break';

  return (
    <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">داوری {competition.name}</h1>
          <p className="mt-2 text-sm text-zinc-500">آثار بدون نام نویسنده نمایش داده می‌شوند.</p>
        </div>
        <CompetitionStatusBadge status={competition.status} />
      </div>

      {scoring && competition.criteria && (
        <Card className="mb-6">
          <h2 className="mb-3 font-semibold">معیارها</h2>
          <p className="mb-3 text-sm text-zinc-500">حد نصاب: {competition.cutoffScore}</p>
          <ul className="flex flex-col gap-2 text-sm">
            {competition.criteria
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(criterion => (
                <li key={criterion.id}>
                  {criterion.name} ({criterion.minScore} تا {criterion.maxScore}) × وزن {criterion.weight}
                </li>
              ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {entries.map(entry => (
          <Link
            key={entry.id}
            href={`/competitions/${id}/judge/${entry.id}`}
            className="rounded-xl bg-white p-5 hover:shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{entry.title}</h3>
              {entry.isInTieBreak && <Badge variant="warning">مساوی</Badge>}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {entry.type?.name} &middot; {formatDateTime(entry.submittedAt)}
            </p>
            <p className="mt-3 line-clamp-3 text-sm text-zinc-600">{entry.content}</p>
          </Link>
        ))}
        {entries.length === 0 && <p className="text-zinc-500">اثری برای داوری نیست.</p>}
      </div>
    </div>
  );
}
