import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState, AuthErrorCode } from '@/features/auth/types';

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = 'authenticated';
      state.error = null;
    },
    clearAuth(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    setError(state, action: PayloadAction<AuthErrorCode>) {
      state.status = 'error';
      state.error = action.payload;
    },
    setLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
  },
});

export const { setUser, clearAuth, setError, setLoading } = authSlice.actions;
export default authSlice.reducer;
