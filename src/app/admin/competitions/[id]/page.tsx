'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  addCriterion,
  assignJudge,
  getAdminCompetition,
  getCompetitionAudit,
  publishCompetition,
  rememberCompetitionId,
  removeCriterion,
  removeJudge,
} from '@/lib/api/competitions';
import { getStoryTypes } from '@/lib/api/story-types';
import { getUsers } from '@/lib/api/users';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { CompetitionForm } from '@/components/competitions/CompetitionForm';
import { Badge, CompetitionStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatDateTime } from '@/lib/utils';
import { fullName } from '@/lib/labels';
import type { AuditLog, Competition, StoryType, User } from '@/types/api';

export default function AdminCompetitionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { ready } = useRequireAuth({ admin: true });
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [storyTypes, setStoryTypes] = useState<StoryType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [criterionName, setCriterionName] = useState('');
  const [minScore, setMinScore] = useState('0');
  const [maxScore, setMaxScore] = useState('10');
  const [weight, setWeight] = useState('1');
  const [sortOrder, setSortOrder] = useState('1');
  const [judgeUserId, setJudgeUserId] = useState('');
  const [isFirstRound, setIsFirstRound] = useState(true);
  const [isSecondRound, setIsSecondRound] = useState(false);

  const load = useCallback(async () => {
    const [next, types, allUsers, logs] = await Promise.all([
      getAdminCompetition(id),
      getStoryTypes(),
      getUsers(),
      getCompetitionAudit(id),
    ]);
    rememberCompetitionId(next.id);
    setCompetition(next);
    setStoryTypes(types);
    setUsers(allUsers);
    setAudit(logs);
  }, [id]);

  useEffect(() => {
    if (!ready) return;
    void Promise.resolve()
      .then(() => load())
      .catch(err => setError(err instanceof Error ? err.message : 'بارگذاری ناموفق بود'))
      .finally(() => setLoading(false));
  }, [ready, load]);

  const draft = competition?.status === 'draft';
  const eligibleJudges = useMemo(
    () => users.filter(user => user.role !== 'admin'),
    [users]
  );

  async function run(action: () => Promise<unknown>) {
    setError('');
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'عملیات ناموفق بود');
    }
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto mt-20 max-w-4xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="mx-auto mt-20 max-w-4xl px-4 py-10">
        <p className="text-red-500">{error || 'مسابقه یافت نشد.'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 flex max-w-4xl flex-col gap-6 px-4 py-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{competition.name}</h1>
          <p className="mt-2 text-sm text-zinc-500">حد نصاب: {competition.cutoffScore}</p>
        </div>
        <CompetitionStatusBadge status={competition.status} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {draft && (
        <>
          <CompetitionForm
            storyTypes={storyTypes}
            onSaved={() => {
              load().catch(() => undefined);
            }}
            initial={{
              id: competition.id,
              name: competition.name,
              description: competition.description,
              applicationDeadline: competition.applicationDeadline,
              firstRoundJudgeCount: competition.firstRoundJudgeCount ?? 1,
              minAcceptVotes: competition.minAcceptVotes ?? 1,
              cutoffScore: Number(competition.cutoffScore ?? 0),
              allowFirstRoundJudgesInSecondRound: competition.allowFirstRoundJudgesInSecondRound,
              allowedTypeIds: competition.allowedTypes?.map(type => type.id) ?? [],
            }}
          />

          <Card>
            <h2 className="mb-4 text-lg font-semibold">معیارها</h2>
            <form
              className="mb-4 grid gap-3 sm:grid-cols-5"
              onSubmit={e => {
                e.preventDefault();
                run(() =>
                  addCriterion(id, {
                    name: criterionName.trim(),
                    minScore: Number(minScore),
                    maxScore: Number(maxScore),
                    weight: Number(weight),
                    sortOrder: Number(sortOrder),
                  }).then(() => {
                    setCriterionName('');
                  })
                );
              }}>
              <Input
                label="نام"
                value={criterionName}
                onChange={e => setCriterionName(e.target.value)}
                required
              />
              <Input
                label="حداقل"
                type="number"
                value={minScore}
                onChange={e => setMinScore(e.target.value)}
                required
              />
              <Input
                label="حداکثر"
                type="number"
                value={maxScore}
                onChange={e => setMaxScore(e.target.value)}
                required
              />
              <Input
                label="وزن"
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                required
              />
              <Input
                label="ترتیب"
                type="number"
                min={1}
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="sm:col-span-5 self-end">
                افزودن معیار
              </Button>
            </form>
            <div className="flex flex-col gap-2">
              {(competition.criteria ?? []).map(criterion => (
                <div
                  key={criterion.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 text-sm">
                  <span>
                    {criterion.sortOrder}. {criterion.name} ({criterion.minScore}–{criterion.maxScore}) وزن{' '}
                    {criterion.weight}
                  </span>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => run(() => removeCriterion(id, criterion.id))}>
                    حذف
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold">داوران</h2>
            <p className="mb-3 text-sm text-zinc-500">مدیران نمی‌توانند داور باشند.</p>
            <form
              className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={e => {
                e.preventDefault();
                run(() =>
                  assignJudge(id, {
                    userId: Number(judgeUserId),
                    isFirstRound,
                    isSecondRound,
                  })
                );
              }}>
              <div className="flex-1">
                <Select
                  label="کاربر"
                  value={judgeUserId}
                  onChange={e => setJudgeUserId(e.target.value)}
                  required>
                  <option value="">انتخاب کنید</option>
                  {eligibleJudges.map(user => (
                    <option
                      key={user.id}
                      value={user.id}>
                      {fullName(user)} ({user.phone})
                    </option>
                  ))}
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isFirstRound}
                  onChange={e => setIsFirstRound(e.target.checked)}
                />
                دور اول
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isSecondRound}
                  onChange={e => setIsSecondRound(e.target.checked)}
                />
                دور دوم
              </label>
              <Button type="submit">افزودن داور</Button>
            </form>
            <div className="flex flex-col gap-2">
              {(competition.judges ?? []).map(judge => (
                <div
                  key={`${judge.user?.id}-${judge.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 text-sm">
                  <span>
                    {fullName(judge.user)} —{judge.isFirstRound ? ' دور اول' : ''}
                    {judge.isSecondRound ? ' دور دوم' : ''}
                  </span>
                  {judge.user && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => run(() => removeJudge(id, judge.user!.id))}>
                      حذف
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Button onClick={() => run(() => publishCompetition(id))}>انتشار مسابقه</Button>
        </>
      )}

      {!draft && (
        <Card>
          <p className="whitespace-pre-wrap text-zinc-700">{competition.description}</p>
          <p className="mt-3 text-sm text-zinc-500">مهلت: {formatDateTime(competition.applicationDeadline)}</p>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-semibold">آثار ارسالی</h2>
        {(competition.entries ?? []).length === 0 && <p className="text-sm text-zinc-500">هنوز اثری ارسال نشده.</p>}
        <div className="flex flex-col gap-4">
          {(competition.entries ?? []).map(entry => (
            <div
              key={entry.id}
              className="rounded-lg border border-zinc-100 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{entry.title}</h3>
                {entry.rank != null && <Badge>رتبه {entry.rank}</Badge>}
                {entry.finalScore != null && <Badge>امتیاز {Number(entry.finalScore).toFixed(2)}</Badge>}
                {entry.advancedToSecondRound && <Badge variant="success">صعود کرده</Badge>}
              </div>
              <p className="text-sm text-zinc-500">
                {fullName(entry.author)} &middot; {entry.type?.name}
              </p>
              {(entry.votes ?? []).length > 0 && (
                <ul className="mt-3 text-sm text-zinc-600">
                  {entry.votes?.map(vote => (
                    <li key={vote.id}>
                      {fullName(vote.judge)}: {vote.decision === 'accept' ? 'قبول' : `رد${vote.rejectReason ? ` — ${vote.rejectReason}` : ''}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">گزارش تغییرات</h2>
          <Link
            href={`/competitions/${id}`}
            className="text-sm text-taupe-800 hover:underline">
            صفحه عمومی
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {audit.map(log => (
            <div
              key={log.id}
              className="rounded-lg bg-zinc-50 p-3">
              <p className="font-medium">{log.action}</p>
              <p className="text-zinc-500">
                {fullName(log.actor)} &middot; {formatDateTime(log.createdAt)}
              </p>
            </div>
          ))}
          {audit.length === 0 && <p className="text-zinc-500">سابقه‌ای نیست.</p>}
        </div>
      </Card>
    </div>
  );
}
