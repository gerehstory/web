'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getJudgeEntries, submitScores, submitVote } from '@/lib/api/competitions';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { CompetitionEntry, JudgeEntriesResponse, VoteDecision } from '@/types/api';

export default function JudgeEntryPage() {
  const params = useParams<{ id: string; entryId: string }>();
  const competitionId = Number(params.id);
  const entryId = Number(params.entryId);
  const router = useRouter();
  const { ready } = useRequireAuth();
  const [data, setData] = useState<JudgeEntriesResponse | null>(null);
  const [entry, setEntry] = useState<CompetitionEntry | null>(null);
  const [decision, setDecision] = useState<VoteDecision>('accept');
  const [rejectReason, setRejectReason] = useState('');
  const [scores, setScores] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    getJudgeEntries(competitionId)
      .then(response => {
        setData(response);
        const found = response.entries.find(item => item.id === entryId) ?? null;
        setEntry(found);
        const initial: Record<number, string> = {};
        response.competition.criteria?.forEach(criterion => {
          initial[criterion.id] = '';
        });
        setScores(initial);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری ناموفق بود'))
      .finally(() => setLoading(false));
  }, [ready, competitionId, entryId]);

  async function handleVote(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await submitVote(competitionId, entryId, {
        decision,
        rejectReason: decision === 'reject' ? rejectReason.trim() : undefined,
      });
      router.push(`/competitions/${competitionId}/judge`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ثبت رأی ناموفق بود');
    } finally {
      setSaving(false);
    }
  }

  async function handleScores(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = (data?.competition.criteria ?? []).map(criterion => ({
        criterionId: criterion.id,
        score: Number(scores[criterion.id]),
      }));
      await submitScores(competitionId, entryId, { scores: payload });
      router.push(`/competitions/${competitionId}/judge`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ثبت امتیاز ناموفق بود');
    } finally {
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error && !entry) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data || !entry) {
    return (
      <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
        <p className="text-red-500">این اثر در فهرست داوری شما نیست.</p>
      </div>
    );
  }

  const status = data.competition.status;
  const isFirst = status === 'first_round';
  const isScoring = status === 'second_round' || status === 'tie_break';

  return (
    <div className="mx-auto mt-20 max-w-3xl px-4 py-10">
      <Card className="mb-6">
        <h1 className="text-2xl font-bold">{entry.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{entry.type?.name}</p>
        <p className="mt-6 whitespace-pre-wrap leading-8 text-zinc-700">{entry.content}</p>
      </Card>

      {isFirst && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">رأی دور اول</h2>
          <form
            onSubmit={handleVote}
            className="flex flex-col gap-4">
            <div className="flex gap-3">
              <Button
                type="button"
                variant={decision === 'accept' ? 'primary' : 'secondary'}
                onClick={() => setDecision('accept')}>
                قبول
              </Button>
              <Button
                type="button"
                variant={decision === 'reject' ? 'danger' : 'secondary'}
                onClick={() => setDecision('reject')}>
                رد
              </Button>
            </div>
            {decision === 'reject' && (
              <Textarea
                label="دلیل رد"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                required
              />
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              disabled={saving}>
              {saving ? 'در حال ثبت...' : 'ثبت رأی'}
            </Button>
          </form>
        </Card>
      )}

      {isScoring && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold">امتیازدهی</h2>
          <form
            onSubmit={handleScores}
            className="flex flex-col gap-4">
            {(data.competition.criteria ?? [])
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(criterion => (
                <Input
                  key={criterion.id}
                  label={`${criterion.name} (${criterion.minScore} تا ${criterion.maxScore})`}
                  type="number"
                  min={criterion.minScore}
                  max={criterion.maxScore}
                  step="0.1"
                  value={scores[criterion.id] ?? ''}
                  onChange={e => setScores(prev => ({ ...prev, [criterion.id]: e.target.value }))}
                  required
                />
              ))}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              disabled={saving}>
              {saving ? 'در حال ثبت...' : 'ثبت امتیازها'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
