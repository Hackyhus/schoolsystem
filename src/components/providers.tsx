'use client';

import { RoleProvider } from '@/context/role-context';
import { ThemeProvider } from '@/context/theme-context';
import { MaintenanceProvider } from '@/context/maintenance-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MaintenanceProvider>
        <RoleProvider>
          {children}
        </RoleProvider>
      </MaintenanceProvider>
    </ThemeProvider>
  );
}
