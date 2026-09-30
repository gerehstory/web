import { apiClient } from '@/lib/api/client';
import type { Comment, CreateCommentDto } from '@/types/api';

export async function createComment(workId: number, data: CreateCommentDto): Promise<Comment> {
  return apiClient<Comment>(`/comment/work/${workId}`, {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function deleteComment(id: number): Promise<void> {
  await apiClient<void>(`/comment/${id}`, { method: 'DELETE', auth: true });
}
