import { apiClient } from '@/lib/api/client';
import type { CreateUserDto, UpdateUserDto, User } from '@/types/api';

export async function getMe(): Promise<User> {
  return apiClient<User>('/users/me', { auth: true });
}

export async function getUsers(): Promise<User[]> {
  return apiClient<User[]>('/users');
}

export async function getUser(id: number): Promise<User> {
  return apiClient<User>(`/users/${id}`);
}

export async function createUser(data: CreateUserDto): Promise<User> {
  return apiClient<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: number, data: UpdateUserDto): Promise<void> {
  await apiClient<void>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient<void>(`/users/${id}`, { method: 'DELETE' });
}
