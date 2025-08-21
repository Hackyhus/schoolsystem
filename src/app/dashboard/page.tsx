'use client';

import { useRole } from '@/context/role-context';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminDashboard } from '@/components/dashboard/admin/admin-dashboard';
import { HodDashboard } from '@/components/dashboard/hod/hod-dashboard';
import { TeacherDashboard } from '@/components/dashboard/teacher/teacher-dashboard';
import { ParentDashboard } from '@/components/dashboard/parent/parent-dashboard';

export default function DashboardPage() {
  const { role, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  switch (role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'HeadOfDepartment':
      return <HodDashboard />;
    case 'Teacher':
      return <TeacherDashboard />;
    case 'Parent':
      return <ParentDashboard />;
    default:
      return <div>Invalid role. Please log out and try again.</div>;
  }
}
