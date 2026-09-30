'use client';

import { useEffect, useState } from 'react';
import { createStoryType, deleteStoryType, getStoryTypes, updateStoryType } from '@/lib/api/story-types';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { StoryType } from '@/types/api';

export default function AdminStoryTypesPage() {
  const { ready } = useRequireAuth({ admin: true });
  const [items, setItems] = useState<StoryType[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setItems(await getStoryTypes());
  }

  useEffect(() => {
    if (!ready) return;
    void Promise.resolve()
      .then(() => load())
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری ناموفق بود'))
      .finally(() => setLoading(false));
  }, [ready]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    try {
      const payload = { name: name.trim(), slug: slug.trim() || undefined };
      if (editingId) await updateStoryType(editingId, payload);
      else await createStoryType(payload);
      setName('');
      setSlug('');
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره ناموفق بود');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('این نوع داستان حذف شود؟')) return;
    setError('');
    try {
      await deleteStoryType(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حذف ناموفق بود');
    }
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900">انواع داستان</h1>
      <Card className="mb-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3">
          <Input
            label="نام"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            label="اسلاگ (اختیاری)"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="short-story"
          />
          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'به‌روزرسانی' : 'افزودن'}</Button>
            {editingId && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setSlug('');
                }}>
                انصراف
              </Button>
            )}
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </Card>

      <div className="flex flex-col gap-2">
        {items.map(item => (
          <Card
            key={item.id}
            className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-zinc-400">{item.slug}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditingId(item.id);
                  setName(item.name);
                  setSlug(item.slug);
                }}>
                ویرایش
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(item.id)}>
                حذف
              </Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <p className="text-zinc-500">نوع داستانی وجود ندارد.</p>}
      </div>
    </div>
  );
}
