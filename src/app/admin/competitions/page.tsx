'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminCompetition, getCompetitions, rememberedCompetitionIds } from '@/lib/api/competitions';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { Button } from '@/components/ui/Button';
import { CompetitionCard } from '@/components/competitions/CompetitionCard';
import type { Competition } from '@/types/api';

export default function AdminCompetitionsPage() {
  const { ready } = useRequireAuth({ admin: true });
  const [items, setItems] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;

    async function load() {
      const publicList = await getCompetitions();
      const remembered = await Promise.all(
        rememberedCompetitionIds().map(id => getAdminCompetition(id).catch(() => null))
      );
      const merged = new Map<number, Competition>();
      [...remembered.filter(Boolean), ...publicList].forEach(item => {
        if (item) merged.set(item.id, item);
      });
      setItems([...merged.values()]);
    }

    load()
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری ناموفق بود'))
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready || loading) {
    return (
      <div className="mx-auto mt-20 max-w-4xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">مسابقات</h1>
        <Link href="/admin/competitions/new">
          <Button>مسابقه جدید</Button>
        </Link>
      </div>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(item => (
          <CompetitionCard
            key={item.id}
            competition={item}
            href={`/admin/competitions/${item.id}`}
          />
        ))}
      </div>
      {items.length === 0 && <p className="text-zinc-500">مسابقه‌ای نیست. یک پیش‌نویس بسازید.</p>}
    </div>
  );
}
