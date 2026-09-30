'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCompetition, submitEntry } from '@/lib/api/competitions';
import { getStoryTypes } from '@/lib/api/story-types';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { Competition, StoryType } from '@/types/api';

export default function EnterCompetitionPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const { ready } = useRequireAuth();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [storyTypes, setStoryTypes] = useState<StoryType[]>([]);
  const [typeId, setTypeId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    Promise.all([getCompetition(id), getStoryTypes()])
      .then(([nextCompetition, types]) => {
        setCompetition(nextCompetition);
        const allowed = nextCompetition.allowedTypes?.length
          ? types.filter(type => nextCompetition.allowedTypes?.some(allowedType => allowedType.id === type.id))
          : types;
        setStoryTypes(allowed);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری ناموفق بود'))
      .finally(() => setLoading(false));
  }, [ready, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await submitEntry(id, { typeId: Number(typeId), title: title.trim(), content: content.trim() });
      router.push(`/competitions/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ارسال اثر ناموفق بود');
    } finally {
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!competition || competition.status !== 'open') {
    return (
      <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
        <p className="text-red-500">{error || 'این مسابقه در حال حاضر پذیرش اثر ندارد.'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
      <Card>
        <h1 className="mb-2 text-2xl font-bold">ارسال اثر به {competition.name}</h1>
        <p className="mb-6 text-sm text-zinc-500">متن کامل را بدون فصل‌بندی ارسال کنید. پس از ارسال امکان ویرایش نیست.</p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4">
          <Select
            label="نوع داستان"
            value={typeId}
            onChange={e => setTypeId(e.target.value)}
            required>
            <option value="">انتخاب کنید</option>
            {storyTypes.map(type => (
              <option
                key={type.id}
                value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
          <Input
            label="عنوان"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <Textarea
            label="متن کامل"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            className="min-h-64"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            disabled={saving}>
            {saving ? 'در حال ارسال...' : 'ارسال اثر'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
