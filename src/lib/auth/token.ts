const TOKEN_KEY = 'sabzlearn_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function extractToken(data: Record<string, unknown>): string | null {
  return (data.access_token as string) || (data.accessToken as string) || (data.token as string) || null;
}
