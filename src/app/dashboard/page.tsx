
'use client';

import { useRole } from '@/context/role-context';
import { Skeleton } from '@/components/ui/skeleton';
import { NewAdminDashboard } from '@/components/dashboard/admin/new-admin-dashboard';
import { HodDashboard } from '@/components/dashboard/hod/hod-dashboard';
import { TeacherDashboard } from '@/components/dashboard/teacher/teacher-dashboard';
import { ParentDashboard } from '@/components/dashboard/parent/parent-dashboard';
import { ExamOfficerDashboard } from '@/components/dashboard/exam-officer/exam-officer-dashboard';

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
    case 'Principal':
    case 'Director':
      return <NewAdminDashboard />;
    case 'HeadOfDepartment':
      return <HodDashboard />;
    case 'ExamOfficer':
        return <ExamOfficerDashboard />;
    case 'Accountant':
      // Using HOD dashboard as a placeholder for now
      return <HodDashboard />;
    case 'Teacher':
      return <TeacherDashboard />;
    case 'Parent':
    case 'Student': // Students use the Parent dashboard
      return <ParentDashboard />;
    default:
      return <div>Invalid role. Please log out and try again.</div>;
  }
}
