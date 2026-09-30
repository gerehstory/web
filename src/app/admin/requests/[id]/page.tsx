'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { approveRevision, getRevision, getRevisionHistory, rejectRevision } from '@/lib/api/revisions';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { Badge, RevisionStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { ChapterList } from '@/components/works/ChapterList';
import { formatDateTime } from '@/lib/utils';
import { fullName, revisionStatusLabel } from '@/lib/labels';
import type { Revision } from '@/types/api';

export default function AdminRevisionDetailPage() {
  const params = useParams<{ id: string }>();
  const revisionId = Number(params.id);
  const { ready } = useRequireAuth({ admin: true });
  const [revision, setRevision] = useState<Revision | null>(null);
  const [history, setHistory] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    const [nextRevision, nextHistory] = await Promise.all([
      getRevision(revisionId),
      getRevisionHistory(revisionId),
    ]);
    setRevision(nextRevision);
    setHistory(nextHistory);
  }, [revisionId]);

  useEffect(() => {
    if (!ready) return;
    void Promise.resolve()
      .then(() => load())
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری ناموفق بود'))
      .finally(() => setLoading(false));
  }, [ready, load]);

  async function handleApprove() {
    setActionLoading(true);
    setError('');
    try {
      await approveRevision(revisionId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تأیید ناموفق بود');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!reason.trim()) return;
    setActionLoading(true);
    setError('');
    try {
      await rejectRevision(revisionId, { reason: reason.trim() });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'رد کردن ناموفق بود');
    } finally {
      setActionLoading(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!revision) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-red-500">{error || 'نسخه یافت نشد.'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 flex max-w-3xl flex-col gap-8 px-4 py-10">
      <Card>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">{revision.title}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {fullName(revision.createdBy)} &middot; نسخه {revision.version} &middot; {formatDateTime(revision.createdAt)}
            </p>
          </div>
          <RevisionStatusBadge status={revision.status} />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {revision.work?.type && <Badge>{revision.work.type.name}</Badge>}
          {revision.work?.genres?.map(genre => (
            <Badge key={genre.id}>{genre.name}</Badge>
          ))}
        </div>

        {revision.reviewMessage && (
          <p className="mb-4 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">پیام بررسی: {revision.reviewMessage}</p>
        )}

        <ChapterList chapters={revision.chapters} />

        {revision.status === 'pending' && (
          <div className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={actionLoading}>
                تأیید
              </Button>
            </div>
            <Textarea
              label="دلیل رد"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="در صورت رد، دلیل را بنویسید"
            />
            <Button
              variant="danger"
              size="sm"
              className="self-start"
              onClick={handleReject}
              disabled={actionLoading || !reason.trim()}>
              رد نسخه
            </Button>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold">تاریخچه نسخه‌ها</h3>
        <div className="flex flex-col gap-3">
          {history.map(item => (
            <div
              key={item.id}
              className="rounded-lg border border-zinc-200 p-4">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-zinc-500">
                نسخه {item.version} &middot; {revisionStatusLabel[item.status]}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
