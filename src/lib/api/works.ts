import { apiClient } from '@/lib/api/client';
import type { CreateRevisionDto, Revision, UpdateRevisionDto, Work } from '@/types/api';

export async function getWorks(): Promise<Work[]> {
  return apiClient<Work[]>('/works');
}

export async function getMyWorks(): Promise<Work[]> {
  return apiClient<Work[]>('/works/me', { auth: true });
}

export async function getWork(id: number): Promise<Work> {
  return apiClient<Work>(`/works/${id}`);
}

export async function getWorkLatest(id: number): Promise<Work> {
  return apiClient<Work>(`/works/${id}/latest`);
}

export async function createWork(data: CreateRevisionDto): Promise<Revision> {
  return apiClient<Revision>('/works', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function updateWork(id: number, data: UpdateRevisionDto): Promise<Revision> {
  return apiClient<Revision>(`/works/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function submitWork(id: number): Promise<Revision> {
  return apiClient<Revision>(`/works/${id}/submit`, { method: 'POST', auth: true });
}
