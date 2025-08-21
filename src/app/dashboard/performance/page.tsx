
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
import { Badge } from '@/components/ui/badge';
import { studentPerformance } from '@/lib/mock-data';

export default function PerformancePage() {

  // This page is now "My Students" for Teachers.
  // The content will be a list of students assigned to the teacher.
  // The previous performance chart is now deprecated in favor of this new view.
  
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
