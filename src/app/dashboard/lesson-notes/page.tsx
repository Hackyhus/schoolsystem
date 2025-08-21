'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { lessonNotes } from '@/lib/mock-data';
import Link from 'next/link';
import { useRole } from '@/context/role-context';
import { Upload } from 'lucide-react';

export default function LessonNotesPage() {
  const { role } = useRole();

  const teacherId = 3; // Mock teacher: Mr. David Chen
  const notes = role === 'Teacher' ? lessonNotes.filter(n => n.teacherId === teacherId) : lessonNotes;

  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };

  const getActionText = () => {
    if (role === 'Teacher') return 'View';
    if (role === 'HeadOfDepartment') return 'Review';
    if (role === 'Admin') return 'Approve';
    return 'View';
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Lesson Notes</h1>
        <p className="text-muted-foreground">
          {role === 'Teacher' ? 'Manage and track your lesson note submissions.' : 'Review and manage all lesson notes.'}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Submissions</CardTitle>
            <CardDescription>
              A complete list of all lesson notes.
            </CardDescription>
          </div>
          {role === 'Teacher' && (
            <Button>
              <Upload className="mr-2 h-4 w-4" /> Upload New Note
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                {role !== 'Teacher' && <TableHead>Teacher</TableHead>}
                <TableHead>Subject</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium">{note.title}</TableCell>
                  {role !== 'Teacher' && <TableCell>{note.teacherName}</TableCell>}
                  <TableCell>{note.subject}</TableCell>
                  <TableCell>{note.submissionDate}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(note.status)}>{note.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/lesson-notes/${note.id}`}>{getActionText()}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
