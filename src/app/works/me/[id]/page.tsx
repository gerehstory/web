'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getWorkLatest, submitWork } from '@/lib/api/works';
import { getRevisionHistory, restoreRevision } from '@/lib/api/revisions';
import { useAuth } from '@/lib/auth/context';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { Badge, RevisionStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChapterList } from '@/components/works/ChapterList';
import { formatDateTime } from '@/lib/utils';
import { latestRevision, sortedChapters } from '@/lib/works';
import { fullName, revisionStatusLabel } from '@/lib/labels';
import type { Revision, Work } from '@/types/api';

export default function MyWorkDetailPage() {
  const params = useParams<{ id: string }>();
  const workId = Number(params.id);
  const { ready, user, isAdmin } = useRequireAuth();
  const { loading: authLoading } = useAuth();
  const [work, setWork] = useState<Work | null>(null);
  const [history, setHistory] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    const latest = await getWorkLatest(workId);
    setWork(latest);
    const revision = latestRevision(latest);
    if (revision) {
      try {
        setHistory(await getRevisionHistory(revision.id));
      } catch {
        setHistory([]);
      }
    }
  }, [workId]);

  useEffect(() => {
    if (!ready) return;
    void Promise.resolve()
      .then(() => load())
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری اثر ناموفق بود'))
      .finally(() => setLoading(false));
  }, [ready, load]);

  const revision = work ? latestRevision(work) : undefined;
  const isOwner = Boolean(user && work?.user && work.user.id === user.id) || isAdmin;

  async function handleSubmit() {
    setActionLoading(true);
    setError('');
    try {
      await submitWork(workId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارسال ناموفق بود');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRestore(id: number) {
    setActionLoading(true);
    setError('');
    try {
      await restoreRevision(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'بازگردانی ناموفق بود');
    } finally {
      setActionLoading(false);
    }
  }

  if (authLoading || loading || !ready) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error && !work) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!work || !revision) return null;

  return (
    <div className="mx-auto mt-20 flex max-w-3xl flex-col gap-8 px-4 py-10">
      <Card>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">{revision.title}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {fullName(work.user)} &middot; نسخه {revision.version} &middot; {formatDateTime(revision.createdAt)}
            </p>
          </div>
          <RevisionStatusBadge status={revision.status} />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {work.type && <Badge>{work.type.name}</Badge>}
          {work.genres?.map(genre => (
            <Badge key={genre.id}>{genre.name}</Badge>
          ))}
        </div>

        {revision.status === 'rejected' && revision.reviewMessage && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">دلیل رد: {revision.reviewMessage}</p>
        )}

        <ChapterList chapters={sortedChapters(revision.chapters)} />

        {isOwner && (
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4">
            {revision.status === 'draft' && (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={actionLoading}>
                {actionLoading ? 'در حال ارسال...' : 'ارسال برای بررسی'}
              </Button>
            )}
            <Link href={`/works/${work.id}/edit`}>
              <Button
                variant="secondary"
                size="sm">
                ویرایش
              </Button>
            </Link>
            {work.publishedRevisionId && (
              <Link href={`/works/${work.id}`}>
                <Button
                  variant="ghost"
                  size="sm">
                  نسخه منتشرشده
                </Button>
              </Link>
            )}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">تاریخچه نسخه‌ها</h3>
        <div className="flex flex-col gap-3">
          {history.map(item => (
            <div
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-4"
              key={item.id}>
              <div>
                <p className="font-medium text-zinc-800">{item.title}</p>
                <p className="text-sm text-zinc-500">
                  نسخه {item.version} &middot; {revisionStatusLabel[item.status]} &middot;{' '}
                  {formatDateTime(item.createdAt)}
                </p>
              </div>
              {item.status === 'approved' && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={actionLoading}
                  onClick={() => handleRestore(item.id)}>
                  بازگردانی
                </Button>
              )}
            </div>
          ))}
          {history.length === 0 && <p className="text-sm text-zinc-500">تاریخچه‌ای وجود ندارد.</p>}
        </div>
      </Card>
    </div>
  );
}
