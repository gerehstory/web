import { apiClient } from '@/lib/api/client';
import type { RejectRevisionDto, Revision } from '@/types/api';

export async function getPendingRevisions(): Promise<Revision[]> {
  return apiClient<Revision[]>('/revisions/pending', { auth: true });
}

export async function getRevision(id: number): Promise<Revision> {
  return apiClient<Revision>(`/revisions/${id}`, { auth: true });
}

export async function approveRevision(id: number): Promise<Revision> {
  return apiClient<Revision>(`/revisions/${id}/approve`, { method: 'POST', auth: true });
}

export async function rejectRevision(id: number, data: RejectRevisionDto): Promise<Revision> {
  return apiClient<Revision>(`/revisions/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function getRevisionHistory(id: number): Promise<Revision[]> {
  return apiClient<Revision[]>(`/revisions/${id}/history`, { auth: true });
}

export async function restoreRevision(id: number): Promise<Revision> {
  return apiClient<Revision>(`/revisions/${id}/restore`, { method: 'POST', auth: true });
}
