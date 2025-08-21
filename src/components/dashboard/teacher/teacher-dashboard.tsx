'use client';
import {
  Book,
  CheckCircle,
  Clock,
  Upload,
  XCircle,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { lessonNotes } from '@/lib/mock-data';
import Link from 'next/link';

export function TeacherDashboard() {
  const teacherId = 3; // Mock teacher: Mr. David Chen
  const myNotes = lessonNotes.filter(n => n.teacherId === teacherId);
  const pendingNotes = myNotes.filter(n => n.status.includes('Pending')).length;
  const approvedNotes = myNotes.filter(n => n.status === 'Approved').length;
  const rejectedNotes = myNotes.filter(n => n.status.includes('Rejected')).length;

  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, Mr. David Chen. Manage your lesson notes and performance data.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myNotes.length}</div>
            <p className="text-xs text-muted-foreground">notes submitted this term</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Notes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedNotes}</div>
            <p className="text-xs text-muted-foreground">notes approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Notes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingNotes}</div>
            <p className="text-xs text-muted-foreground">awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Notes</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedNotes}</div>
            <p className="text-xs text-muted-foreground">require your attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Lesson Notes</CardTitle>
            <CardDescription>
              Track the submission status of your lesson notes.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/lesson-notes">
              <Upload className="mr-2 h-4 w-4" /> Upload New Note
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium">{note.title}</TableCell>
                  <TableCell>{note.subject}</TableCell>
                  <TableCell>{note.submissionDate}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(note.status)}>{note.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                       <Link href={`/dashboard/lesson-notes/${note.id}`}>View</Link>
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
