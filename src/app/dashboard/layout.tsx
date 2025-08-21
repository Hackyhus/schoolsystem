
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useRole } from '@/context/role-context';
import { SandTimer } from '@/components/icons/sand-timer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !role) {
      router.push('/');
    }
  }, [role, isLoading, router]);

  if (isLoading || !role) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <SandTimer />
        <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Loading Portal...</h2>
            <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-body">
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="min-h-[calc(100vh-4rem)] p-4 md:p-8 lg:p-10">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
