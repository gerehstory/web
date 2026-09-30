'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGenres } from '@/lib/api/genres';
import { getStoryTypes } from '@/lib/api/story-types';
import { getWorkLatest } from '@/lib/api/works';
import { useAuth } from '@/lib/auth/context';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { WorkForm } from '@/components/works/WorkForm';
import { latestRevision, sortedChapters } from '@/lib/works';
import type { Genre, StoryType, Work } from '@/types/api';

export default function EditWorkPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const workId = Number(params.id);
  const { ready, user, isAdmin } = useRequireAuth();
  const { loading: authLoading } = useAuth();
  const [work, setWork] = useState<Work | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [storyTypes, setStoryTypes] = useState<StoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    Promise.all([getWorkLatest(workId), getGenres(), getStoryTypes()])
      .then(([nextWork, nextGenres, nextTypes]) => {
        if (user && nextWork.user && nextWork.user.id !== user.id && !isAdmin) {
          router.push(`/works/${workId}`);
          return;
        }
        setWork(nextWork);
        setGenres(nextGenres);
        setStoryTypes(nextTypes);
      })
      .catch(() => router.push('/works/me'))
      .finally(() => setLoading(false));
  }, [ready, workId, user, isAdmin, router]);

  if (authLoading || !ready || loading) {
    return (
      <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!work) return null;

  const revision = latestRevision(work);

  return (
    <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
      <WorkForm
        genres={genres}
        storyTypes={storyTypes}
        initial={{
          workId: work.id,
          title: revision?.title ?? '',
          chapters: sortedChapters(revision?.chapters).map(chapter => ({
            title: chapter.title,
            content: chapter.content,
          })),
          typeId: work.type?.id,
          genres: work.genres ?? [],
        }}
      />
    </div>
  );
}
