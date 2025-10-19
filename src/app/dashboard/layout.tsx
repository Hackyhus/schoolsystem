
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, SidebarInset, Sidebar } from '@/components/ui/sidebar';
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
    <SidebarProvider>
      <div className="font-body h-screen flex flex-col">
        <style jsx global>{`
          @media print {
            body, html {
              height: auto;
            }
            .print-hidden {
              display: none !important;
            }
            main {
              width: 100%;
              margin: 0;
              padding: 0 !important;
              min-height: auto;
              overflow: visible !important;
            }
            body > div, 
            body > div > div, 
            body > div > div > div {
              display: block !important;
              height: auto !important;
              overflow: visible !important;
            }
          }
        `}</style>
         <div className="flex flex-1 overflow-hidden">
          <div className="print-hidden">
            <DashboardSidebar />
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
             <div className="print-hidden sticky top-0 z-20 bg-background">
                <MaintenanceBanner />
                <DashboardHeader />
              </div>
              <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
              </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
