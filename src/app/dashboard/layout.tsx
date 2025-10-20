
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useRole } from '@/context/role-context';
import { Loader2, ShieldAlert } from 'lucide-react';
import { MaintenanceBanner } from '@/components/maintenance-banner';
import { isPathAuthorized, navConfig } from '@/lib/auth-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SupportBot } from '@/components/dashboard/support-bot/SupportBot';

function AccessDenied() {
    const router = useRouter();
    return (
        <div className="flex flex-1 items-center justify-center h-full">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-3xl text-destructive">
                        <ShieldAlert className="h-8 w-8" />
                        Access Denied
                    </CardTitle>
                    <CardDescription>
                        You do not have the necessary permissions to view this page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        The page you are trying to access is restricted to other user roles.
                    </p>
                    <Button onClick={() => router.push('/dashboard')} className="mt-6">
                        Return to Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role, isLoading } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!role) {
      router.push('/');
      return;
    }

    const authorized = isPathAuthorized(pathname, role);
    setIsAuthorized(authorized);

  }, [role, isLoading, router, pathname]);

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
              <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
                {isAuthorized ? children : <AccessDenied />}
              </main>
          </div>
        </div>
        <SupportBot />
      </div>
    </SidebarProvider>
  );
}
