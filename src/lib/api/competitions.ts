import { apiClient } from '@/lib/api/client';
import type {
  AssignJudgeDto,
  AuditLog,
  Competition,
  CompetitionCriterion,
  CompetitionEntry,
  CompetitionJudge,
  CreateCompetitionDto,
  CreateCriterionDto,
  CreateEntryDto,
  JudgeEntriesResponse,
  SubmitScoresDto,
  SubmitVoteDto,
  UpdateCompetitionDto,
  UpdateCriterionDto,
} from '@/types/api';

const DRAFT_IDS_KEY = 'sabzlearn_admin_competition_ids';

export function rememberCompetitionId(id: number) {
  if (typeof window === 'undefined') return;
  const ids = rememberedCompetitionIds();
  if (!ids.includes(id)) {
    localStorage.setItem(DRAFT_IDS_KEY, JSON.stringify([id, ...ids].slice(0, 50)));
  }
}

export function rememberedCompetitionIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DRAFT_IDS_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export async function getCompetitions(): Promise<Competition[]> {
  return apiClient<Competition[]>('/competitions');
}

export async function getCompetition(id: number): Promise<Competition> {
  return apiClient<Competition>(`/competitions/${id}`);
}

export async function getPublicEntries(id: number): Promise<CompetitionEntry[]> {
  return apiClient<CompetitionEntry[]>(`/competitions/${id}/public-entries`);
}

export async function createCompetition(data: CreateCompetitionDto): Promise<Competition> {
  const competition = await apiClient<Competition>('/competitions', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
  rememberCompetitionId(competition.id);
  return competition;
}

export async function updateCompetition(id: number, data: UpdateCompetitionDto): Promise<Competition> {
  return apiClient<Competition>(`/competitions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function publishCompetition(id: number): Promise<Competition> {
  return apiClient<Competition>(`/competitions/${id}/publish`, { method: 'POST', auth: true });
}

export async function getAdminCompetition(id: number): Promise<Competition> {
  return apiClient<Competition>(`/competitions/${id}/admin`, { auth: true });
}

export async function getCompetitionAudit(id: number): Promise<AuditLog[]> {
  return apiClient<AuditLog[]>(`/competitions/${id}/audit`, { auth: true });
}

export async function addCriterion(id: number, data: CreateCriterionDto): Promise<CompetitionCriterion> {
  return apiClient<CompetitionCriterion>(`/competitions/${id}/criteria`, {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function updateCriterion(
  id: number,
  criterionId: number,
  data: UpdateCriterionDto
): Promise<CompetitionCriterion> {
  return apiClient<CompetitionCriterion>(`/competitions/${id}/criteria/${criterionId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function removeCriterion(id: number, criterionId: number): Promise<void> {
  await apiClient<void>(`/competitions/${id}/criteria/${criterionId}`, { method: 'DELETE', auth: true });
}

export async function assignJudge(id: number, data: AssignJudgeDto): Promise<CompetitionJudge> {
  return apiClient<CompetitionJudge>(`/competitions/${id}/judges`, {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function removeJudge(id: number, userId: number): Promise<void> {
  await apiClient<void>(`/competitions/${id}/judges/${userId}`, { method: 'DELETE', auth: true });
}

export async function submitEntry(id: number, data: CreateEntryDto): Promise<CompetitionEntry> {
  return apiClient<CompetitionEntry>(`/competitions/${id}/entries`, {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function getMyEntry(id: number): Promise<CompetitionEntry> {
  return apiClient<CompetitionEntry>(`/competitions/${id}/entries/me`, { auth: true });
}

export async function getJudgeEntries(id: number): Promise<JudgeEntriesResponse> {
  return apiClient<JudgeEntriesResponse>(`/competitions/${id}/judge/entries`, { auth: true });
}

export async function submitVote(id: number, entryId: number, data: SubmitVoteDto) {
  return apiClient(`/competitions/${id}/entries/${entryId}/votes`, {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function submitScores(id: number, entryId: number, data: SubmitScoresDto) {
  return apiClient(`/competitions/${id}/entries/${entryId}/scores`, {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}
