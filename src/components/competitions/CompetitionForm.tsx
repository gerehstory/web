'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateCompetitionDto, StoryType } from '@/types/api';
import { createCompetition, updateCompetition } from '@/lib/api/competitions';
import { fromDatetimeLocal, toDatetimeLocal } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface Props {
  storyTypes: StoryType[];
  onSaved?: () => void;
  initial?: {
    id: number;
    name: string;
    description: string;
    applicationDeadline: string;
    firstRoundJudgeCount: number;
    minAcceptVotes: number;
    cutoffScore: number;
    allowFirstRoundJudgesInSecondRound: boolean;
    allowedTypeIds: number[];
  };
}

export function CompetitionForm({ storyTypes, initial, onSaved }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [deadline, setDeadline] = useState(
    initial?.applicationDeadline ? toDatetimeLocal(initial.applicationDeadline) : ''
  );
  const [firstRoundJudgeCount, setFirstRoundJudgeCount] = useState(String(initial?.firstRoundJudgeCount ?? 3));
  const [minAcceptVotes, setMinAcceptVotes] = useState(String(initial?.minAcceptVotes ?? 2));
  const [cutoffScore, setCutoffScore] = useState(String(initial?.cutoffScore ?? 12));
  const [allowBoth, setAllowBoth] = useState(initial?.allowFirstRoundJudgesInSecondRound ?? false);
  const [allowedTypeIds, setAllowedTypeIds] = useState<number[]>(initial?.allowedTypeIds ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleType(id: number) {
    setAllowedTypeIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload: CreateCompetitionDto = {
      name: name.trim(),
      description: description.trim(),
      applicationDeadline: fromDatetimeLocal(deadline),
      firstRoundJudgeCount: Number(firstRoundJudgeCount),
      minAcceptVotes: Number(minAcceptVotes),
      cutoffScore: Number(cutoffScore),
      allowFirstRoundJudgesInSecondRound: allowBoth,
      allowedTypeIds: allowedTypeIds.length ? allowedTypeIds : undefined,
    };

    try {
      if (initial) {
        await updateCompetition(initial.id, payload);
        onSaved?.();
      } else {
        const created = await createCompetition(payload);
        router.push(`/admin/competitions/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ذخیره مسابقه ناموفق بود');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-6 text-xl font-bold text-zinc-900">{initial ? 'ویرایش مسابقه' : 'مسابقه جدید'}</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4">
        <Input
          label="نام"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <Textarea
          label="توضیحات"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <Input
          label="مهلت ارسال"
          type="datetime-local"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="تعداد داور دور اول"
            type="number"
            min={1}
            value={firstRoundJudgeCount}
            onChange={e => setFirstRoundJudgeCount(e.target.value)}
            required
          />
          <Input
            label="حداقل رأی قبول"
            type="number"
            min={1}
            value={minAcceptVotes}
            onChange={e => setMinAcceptVotes(e.target.value)}
            required
          />
          <Input
            label="حد نصاب امتیاز"
            type="number"
            value={cutoffScore}
            onChange={e => setCutoffScore(e.target.value)}
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={allowBoth}
            onChange={e => setAllowBoth(e.target.checked)}
          />
          داوران دور اول بتوانند در دور دوم هم داوری کنند
        </label>
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700">انواع مجاز (خالی = همه)</p>
          <div className="flex flex-wrap gap-2">
            {storyTypes.map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleType(type.id)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  allowedTypeIds.includes(type.id) ? 'bg-taupe-800 text-white' : 'bg-zinc-100 text-zinc-600'
                }`}>
                {type.name}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          type="submit"
          disabled={loading}>
          {loading ? 'در حال ذخیره...' : initial ? 'ذخیره تغییرات' : 'ایجاد مسابقه'}
        </Button>
      </form>
    </Card>
  );
}
