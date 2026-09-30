import { apiClient } from '@/lib/api/client';
import type { AuthenticateDto, AuthResponse, VerifyOtpDto } from '@/types/api';

export async function requestOtp(data: AuthenticateDto): Promise<void> {
  await apiClient<void>('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyOtp(data: VerifyOtpDto): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
