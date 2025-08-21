'use client';

import { RoleProvider } from '@/context/role-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <RoleProvider>{children}</RoleProvider>;
}
