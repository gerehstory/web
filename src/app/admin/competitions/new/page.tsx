'use client';

import { useEffect, useState } from 'react';
import { getStoryTypes } from '@/lib/api/story-types';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { CompetitionForm } from '@/components/competitions/CompetitionForm';
import type { StoryType } from '@/types/api';

export default function NewCompetitionPage() {
  const { ready } = useRequireAuth({ admin: true });
  const [storyTypes, setStoryTypes] = useState<StoryType[]>([]);

  useEffect(() => {
    if (!ready) return;
    getStoryTypes().then(setStoryTypes);
  }, [ready]);

  if (!ready) {
    return (
      <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
      <CompetitionForm storyTypes={storyTypes} />
    </div>
  );
}
