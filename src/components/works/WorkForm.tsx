'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ChapterInput, Genre, StoryType } from '@/types/api';
import { createWork, updateWork } from '@/lib/api/works';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';

interface WorkFormProps {
  genres: Genre[];
  storyTypes: StoryType[];
  initial?: {
    workId: number;
    title: string;
    chapters: ChapterInput[];
    typeId?: number;
    genres?: Genre[];
  };
}

const emptyChapter = (): ChapterInput => ({ title: '', content: '' });

export function WorkForm({ genres, storyTypes, initial }: WorkFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isEdit = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [typeId, setTypeId] = useState(initial?.typeId ? String(initial.typeId) : '');
  const [selectedGenres, setSelectedGenres] = useState<number[]>(initial?.genres?.map(g => g.id) ?? []);
  const [chapters, setChapters] = useState<ChapterInput[]>(
    initial?.chapters?.length ? initial.chapters.map(ch => ({ title: ch.title, content: ch.content })) : [emptyChapter()]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleGenre(id: number) {
    setSelectedGenres(prev => (prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]));
  }

  function updateChapter(index: number, patch: Partial<ChapterInput>) {
    setChapters(prev => prev.map((chapter, i) => (i === index ? { ...chapter, ...patch } : chapter)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const cleaned = chapters
      .map((chapter, index) => ({
        position: index + 1,
        title: chapter.title.trim(),
        content: chapter.content.trim(),
      }))
      .filter(chapter => chapter.title && chapter.content);

    if (cleaned.length === 0) {
      setError('حداقل یک فصل با عنوان و متن لازم است.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (initial) {
        await updateWork(initial.workId, { title, chapters: cleaned });
        router.push(`/works/me/${initial.workId}`);
        return;
      }

      if (!typeId) {
        setError('نوع داستان را انتخاب کنید.');
        setLoading(false);
        return;
      }

      const revision = await createWork({
        title,
        typeId: Number(typeId),
        genres: selectedGenres,
        chapters: cleaned,
      });
      const workId = revision.work?.id;
      router.push(workId ? `/works/me/${workId}` : '/works/me');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره اثر ناموفق بود');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">{isEdit ? 'ویرایش اثر' : 'ایجاد اثر جدید'}</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5">
        <Input
          label="عنوان"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          placeholder="عنوان اثر را وارد کنید"
        />

        {!isEdit && (
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
        )}

        {!isEdit && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700">ژانرها (اختیاری)</span>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedGenres.includes(genre.id)
                      ? 'bg-taupe-800 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}>
                  {genre.name}
                </button>
              ))}
            </div>
            {genres.length === 0 && <p className="text-sm text-zinc-500">هنوز ژانری وجود ندارد.</p>}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-700">فصل‌ها</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setChapters(prev => [...prev, emptyChapter()])}>
              افزودن فصل
            </Button>
          </div>

          {chapters.map((chapter, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-600">فصل {index + 1}</span>
                {chapters.length > 1 && (
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:text-red-700"
                    onClick={() => setChapters(prev => prev.filter((_, i) => i !== index))}>
                    حذف
                  </button>
                )}
              </div>
              <Input
                label="عنوان فصل"
                value={chapter.title}
                onChange={e => updateChapter(index, { title: e.target.value })}
                required
              />
              <Textarea
                label="متن فصل"
                value={chapter.content}
                onChange={e => updateChapter(index, { content: e.target.value })}
                required
                minLength={1}
                placeholder="متن این فصل را بنویسید..."
              />
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}>
            {loading ? 'در حال ذخیره...' : isEdit ? 'به‌روزرسانی اثر' : 'ایجاد اثر'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}>
            انصراف
          </Button>
        </div>
      </form>
    </Card>
  );
}
