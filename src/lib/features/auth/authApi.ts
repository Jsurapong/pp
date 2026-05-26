import type { User, LoginPayload, ApiErrorBody, AuthErrorCode } from '@/lib/types/auth';

function mapErrorCode(code: string): AuthErrorCode {
  switch (code) {
    case 'INVALID_CREDENTIALS':
      return 'INVALID_CREDENTIALS';
    case 'VALIDATION_ERROR':
      return 'VALIDATION_ERROR';
    case 'UNAUTHORIZED':
      return 'UNAUTHORIZED';
    default:
      return 'INTERNAL_ERROR';
  }
}

export async function loginRequest({ email, password }: LoginPayload): Promise<User> {
  let res: Response;
  try {
    res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw { code: 'NETWORK_ERROR' as AuthErrorCode };
  }

  if (!res.ok) {
    if (res.status === 400) {
      throw { code: 'VALIDATION_ERROR' as AuthErrorCode };
    }
    if (res.status === 401) {
      let body: ApiErrorBody | null = null;
      try {
        body = (await res.json()) as ApiErrorBody;
      } catch {
        // ignore parse error
      }
      const code = body?.error?.code ?? 'INVALID_CREDENTIALS';
      throw { code: mapErrorCode(code) };
    }
    throw { code: 'INTERNAL_ERROR' as AuthErrorCode };
  }

  const data = (await res.json()) as { user: User };
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // ignore errors on logout
  }
}

export async function fetchCurrentUser(): Promise<User | null> {
  let res: Response;
  try {
    res = await fetch('/api/auth/me', {
      credentials: 'include',
    });
  } catch {
    return null;
  }

  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as { user: User };
  return data.user;
}
