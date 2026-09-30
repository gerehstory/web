'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { approveRevision, getPendingRevisions, rejectRevision } from '@/lib/api/revisions';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { formatDateTime } from '@/lib/utils';
import { fullName } from '@/lib/labels';
import { sortedChapters } from '@/lib/works';
import type { Revision } from '@/types/api';

export default function AdminRequestsPage() {
  const { ready } = useRequireAuth({ admin: true });
  const [requests, setRequests] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    getPendingRevisions()
      .then(setRequests)
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری ناموفق بود'))
      .finally(() => setLoading(false));
  }, [ready]);

  async function handleApprove(id: number) {
    setActionLoading(true);
    setError('');
    try {
      await approveRevision(id);
      setRequests(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تأیید ناموفق بود');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(id: number) {
    if (!reason.trim()) return;
    setActionLoading(true);
    setError('');
    try {
      await rejectRevision(id, { reason: reason.trim() });
      setRequests(prev => prev.filter(item => item.id !== id));
      setRejectingId(null);
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'رد کردن ناموفق بود');
    } finally {
      setActionLoading(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto mt-20 max-w-4xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-zinc-900">درخواست‌های در انتظار</h1>
      {error && <p className="mb-4 text-red-500">{error}</p>}

      <div className="flex flex-col gap-4">
        {requests.length === 0 && <p className="text-zinc-500">درخواست معلقی وجود ندارد.</p>}

        {requests.map(req => {
          const excerpt = sortedChapters(req.chapters)
            .map(chapter => chapter.content)
            .join(' ')
            .slice(0, 180);
          return (
            <Card key={req.id}>
              <div className="mb-3">
                <Link
                  href={`/admin/requests/${req.id}`}
                  className="text-lg font-semibold text-taupe-800 hover:underline">
                  {req.title}
                </Link>
                <p className="text-sm text-zinc-500">
                  {fullName(req.createdBy)} &middot; نسخه {req.version} &middot; {formatDateTime(req.createdAt)}
                </p>
              </div>
              <p className="mb-4 text-sm text-zinc-600">{excerpt}{excerpt.length >= 180 ? '…' : ''}</p>

              {rejectingId === req.id ? (
                <div className="flex flex-col gap-3">
                  <Textarea
                    label="دلیل رد"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                    placeholder="دلیل رد این اثر را توضیح دهید..."
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(req.id)}
                      disabled={actionLoading || !reason.trim()}>
                      تأیید رد
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRejectingId(null);
                        setReason('');
                      }}>
                      انصراف
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(req.id)}
                    disabled={actionLoading}>
                    تأیید
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setRejectingId(req.id)}
                    disabled={actionLoading}>
                    رد
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
