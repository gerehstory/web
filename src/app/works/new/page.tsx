'use client';

import { useEffect, useState } from 'react';
import { getGenres } from '@/lib/api/genres';
import { getStoryTypes } from '@/lib/api/story-types';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { WorkForm } from '@/components/works/WorkForm';
import type { Genre, StoryType } from '@/types/api';

export default function NewWorkPage() {
  const { ready } = useRequireAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [storyTypes, setStoryTypes] = useState<StoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    Promise.all([getGenres(), getStoryTypes()])
      .then(([nextGenres, nextTypes]) => {
        setGenres(nextGenres);
        setStoryTypes(nextTypes);
      })
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready || loading) {
    return (
      <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
      <WorkForm
        genres={genres}
        storyTypes={storyTypes}
      />
    </div>
  );
}
