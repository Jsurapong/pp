'use client';

import { useEffect } from 'react';
import AppShell from '@/shared/components/layout/AppShell';
import { useAppDispatch } from '@/shared/lib/hooks';
import { setUser, clearAuth, fetchCurrentUser } from '@/features/auth';

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
