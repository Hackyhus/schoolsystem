'use client';

import { RoleProvider } from '@/context/role-context';
import { UserProvider } from '@/context/user-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <UserProvider>{children}</UserProvider>
    </RoleProvider>
  );
}
