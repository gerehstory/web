'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import { getCompetition, getJudgeEntries, getMyEntry, getPublicEntries } from '@/lib/api/competitions';
import { useAuth } from '@/lib/auth/context';
import { Badge, CompetitionStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDateTime, isJudgingActive } from '@/lib/utils';
import { fullName } from '@/lib/labels';
import type { Competition, CompetitionEntry } from '@/types/api';

export default function CompetitionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [myEntry, setMyEntry] = useState<CompetitionEntry | null>(null);
  const [winners, setWinners] = useState<CompetitionEntry[]>([]);
  const [canJudge, setCanJudge] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await getCompetition(id);
        if (cancelled) return;
        setCompetition(next);

        if (next.status === 'completed') {
          setWinners(await getPublicEntries(id));
        }

        if (isAuthenticated) {
          try {
            setMyEntry(await getMyEntry(id));
          } catch (err) {
            if (!(err instanceof ApiError && err.status === 404)) {
              // ignore "not found" for users without an entry
            }
            setMyEntry(null);
          }

          if (isJudgingActive(next.status)) {
            try {
              await getJudgeEntries(id);
              if (!cancelled) setCanJudge(true);
            } catch {
              if (!cancelled) setCanJudge(false);
            }
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'بارگذاری ناموفق بود');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!authLoading) load();
    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-red-500">{error || 'مسابقه یافت نشد.'}</p>
      </div>
    );
  }

  const deadlinePassed = new Date(competition.applicationDeadline).getTime() <= now;
  const canEnter = competition.status === 'open' && !deadlinePassed && isAuthenticated && !myEntry;

  return (
    <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
      <Card className="mb-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold text-zinc-900">{competition.name}</h1>
          <CompetitionStatusBadge status={competition.status} />
        </div>
        <p className="whitespace-pre-wrap text-zinc-700">{competition.description}</p>
        <p className="mt-4 text-sm text-zinc-500">مهلت ارسال: {formatDateTime(competition.applicationDeadline)}</p>
        {competition.allowedTypes && competition.allowedTypes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {competition.allowedTypes.map(type => (
              <Badge key={type.id}>{type.name}</Badge>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {canEnter && (
            <Link href={`/competitions/${id}/enter`}>
              <Button>ارسال اثر</Button>
            </Link>
          )}
          {canJudge && (
            <Link href={`/competitions/${id}/judge`}>
              <Button variant="secondary">داوری</Button>
            </Link>
          )}
          {isAdmin && (
            <Link href={`/admin/competitions/${id}`}>
              <Button variant="ghost">مدیریت</Button>
            </Link>
          )}
        </div>
      </Card>

      {myEntry && (
        <Card className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">اثر ارسالی من</h2>
          <p className="font-medium">{myEntry.title}</p>
          <p className="mt-1 text-sm text-zinc-500">{myEntry.type?.name}</p>
          <p className="mt-4 whitespace-pre-wrap text-zinc-700">{myEntry.content}</p>
        </Card>
      )}

      {competition.status === 'completed' && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">برندگان</h2>
          {winners.length === 0 && <p className="text-sm text-zinc-500">اثر عمومی‌ای ثبت نشده است.</p>}
          <div className="flex flex-col gap-4">
            {winners.map(entry => (
              <div
                key={entry.id}
                className="rounded-lg border border-zinc-100 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">{entry.title}</h3>
                  {entry.rank != null && <Badge>رتبه {entry.rank}</Badge>}
                </div>
                <p className="text-sm text-zinc-500">{fullName(entry.author)}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{entry.content}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
