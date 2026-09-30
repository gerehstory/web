'use client';

import { useEffect, useState } from 'react';
import { createGenre, deleteGenre, getGenres, updateGenre } from '@/lib/api/genres';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { Genre } from '@/types/api';

export default function AdminGenresPage() {
  const { ready } = useRequireAuth({ admin: true });
  const [items, setItems] = useState<Genre[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    const next = await getGenres();
    setItems(next);
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
      if (editingId) {
        await updateGenre(editingId, { name: name.trim() });
      } else {
        await createGenre({ name: name.trim() });
      }
      setName('');
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره ناموفق بود');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('این ژانر حذف شود؟')) return;
    setError('');
    try {
      await deleteGenre(id);
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
      <h1 className="mb-6 text-3xl font-bold text-zinc-900">ژانرها</h1>
      <Card className="mb-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label={editingId ? 'ویرایش ژانر' : 'ژانر جدید'}
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <Button type="submit">{editingId ? 'به‌روزرسانی' : 'افزودن'}</Button>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setName('');
              }}>
              انصراف
            </Button>
          )}
        </form>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </Card>

      <div className="flex flex-col gap-2">
        {items.map(item => (
          <Card
            key={item.id}
            className="flex items-center justify-between p-4">
            <span>{item.name}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditingId(item.id);
                  setName(item.name);
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
        {items.length === 0 && <p className="text-zinc-500">ژانری وجود ندارد.</p>}
      </div>
    </div>
  );
}
