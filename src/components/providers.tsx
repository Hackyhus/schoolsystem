'use client';

import { RoleProvider } from '@/context/role-context';
import { ThemeProvider } from '@/context/theme-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RoleProvider>
        {children}
      </RoleProvider>
    </ThemeProvider>
  );
}
