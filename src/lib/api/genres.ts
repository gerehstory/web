import { apiClient } from '@/lib/api/client';
import type { CreateGenreDto, Genre, UpdateGenreDto } from '@/types/api';

export async function getGenres(): Promise<Genre[]> {
  return apiClient<Genre[]>('/genre');
}

export async function getGenre(id: number): Promise<Genre> {
  return apiClient<Genre>(`/genre/${id}`);
}

export async function createGenre(data: CreateGenreDto): Promise<Genre> {
  return apiClient<Genre>('/genre', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function updateGenre(id: number, data: UpdateGenreDto): Promise<Genre> {
  return apiClient<Genre>(`/genre/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function deleteGenre(id: number): Promise<void> {
  await apiClient<void>(`/genre/${id}`, { method: 'DELETE', auth: true });
}
