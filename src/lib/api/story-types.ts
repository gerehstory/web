import { apiClient } from '@/lib/api/client';
import type { CreateStoryTypeDto, StoryType, UpdateStoryTypeDto } from '@/types/api';

export async function getStoryTypes(): Promise<StoryType[]> {
  return apiClient<StoryType[]>('/story-types');
}

export async function getStoryType(id: number): Promise<StoryType> {
  return apiClient<StoryType>(`/story-types/${id}`);
}

export async function createStoryType(data: CreateStoryTypeDto): Promise<StoryType> {
  return apiClient<StoryType>('/story-types', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function updateStoryType(id: number, data: UpdateStoryTypeDto): Promise<StoryType> {
  return apiClient<StoryType>(`/story-types/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function deleteStoryType(id: number): Promise<void> {
  await apiClient<void>(`/story-types/${id}`, { method: 'DELETE', auth: true });
}
