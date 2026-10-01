import { getToken } from '@/lib/auth/token';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api-eight-taupe-26.vercel.app';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function parseErrorMessage(text: string, fallback: string) {
  if (!text) return fallback;
  try {
    const json = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join('، ');
    if (typeof json.message === 'string') return json.message;
  } catch {
    // not JSON
  }
  return text;
}

export async function apiClient<T>(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const { auth = false, ...fetchOptions } = options;
  const token = getToken();

  if (auth && !token) {
    throw new ApiError(401, 'برای این کار باید وارد شوید');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, parseErrorMessage(text, res.statusText));
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>;
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
