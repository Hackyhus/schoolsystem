
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useRole } from '@/context/role-context';
import { Loader2 } from 'lucide-react';
import { MaintenanceBanner } from '@/components/maintenance-banner';

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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-foreground">Loading Portal...</h2>
            <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-body">
      <style jsx global>{`
        @media print {
          /* This targets the main content area and removes the margin-left added by the sidebar logic */
          main[data-sidebar="inset"] {
            margin-left: 0 !important;
          }
          .print-hidden {
            display: none;
          }
        }
      `}</style>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset data-sidebar="inset">
          <MaintenanceBanner />
          <DashboardHeader />
          <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
