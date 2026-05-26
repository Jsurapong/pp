export interface User {
  id: string;
  email: string;
  name: string;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'UNAUTHORIZED'
  | 'NETWORK_ERROR';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: AuthErrorCode | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
