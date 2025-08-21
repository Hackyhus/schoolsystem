
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRole } from '@/context/role-context';
import { ParentDashboard } from '@/components/dashboard/parent/parent-dashboard';

export default function PerformancePage() {
  const { role } = useRole();

  // For parents, this page shows the full performance dashboard.
  if (role === 'Parent') {
    return <ParentDashboard />;
  }
  
  // For Teachers, this page is "My Students".
  // The content will be a list of students assigned to the teacher.
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          My Students
        </h1>
        <p className="text-muted-foreground">
          View and manage performance for students in your classes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            A list of all students assigned to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* This will be populated with real data later */}
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No students assigned to you yet.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
