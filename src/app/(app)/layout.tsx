'use client';

import { useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAppDispatch } from '@/lib/hooks';
import { setUser, clearAuth } from '@/lib/features/auth/authSlice';
import { fetchCurrentUser } from '@/lib/features/auth/authApi';

function AuthBootstrapper() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchCurrentUser().then((user) => {
      if (user) {
        dispatch(setUser(user));
      } else {
        dispatch(clearAuth());
      }
    });
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AuthBootstrapper />
      {children}
    </AppShell>
  );
}
