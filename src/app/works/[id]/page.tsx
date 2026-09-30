'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getWork } from '@/lib/api/works';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CommentSection } from '@/components/comments/CommentSection';
import { LikeButton } from '@/components/works/LikeButton';
import { ChapterList } from '@/components/works/ChapterList';
import { formatDateTime } from '@/lib/utils';
import { displayRevision } from '@/lib/works';
import { fullName } from '@/lib/labels';
import type { Work } from '@/types/api';

export default function WorkDetailPage() {
  const params = useParams<{ id: string }>();
  const workId = Number(params.id);
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getWork(workId)
      .then(setWork)
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری اثر ناموفق بود'))
      .finally(() => setLoading(false));
  }, [workId]);

  if (loading) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-red-500">{error || 'اثر یافت نشد.'}</p>
      </div>
    );
  }

  const revision = displayRevision(work);

  return (
    <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
      <Card className="mb-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-zinc-900">{revision?.title}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {fullName(work.user)} &middot; {formatDateTime(work.createdAt)}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {work.type && <Badge>{work.type.name}</Badge>}
          {work.genres?.map(genre => (
            <Badge key={genre.id}>{genre.name}</Badge>
          ))}
        </div>

        <ChapterList chapters={revision?.chapters} />

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4">
          <LikeButton work={work} />
        </div>
      </Card>

      <Card>
        <CommentSection
          workId={work.id}
          initialComments={work.comments ?? []}
        />
      </Card>
    </div>
  );
}
