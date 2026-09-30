import { apiClient } from '@/lib/api/client';
import type { Like } from '@/types/api';

export async function likeWork(workId: number): Promise<Like> {
  return apiClient<Like>(`/like/work/${workId}`, { method: 'POST', auth: true });
}

export async function unlikeWork(likeId: number): Promise<void> {
  await apiClient<void>(`/like/${likeId}`, { method: 'DELETE', auth: true });
}
