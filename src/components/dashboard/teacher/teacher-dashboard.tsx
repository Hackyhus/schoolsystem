'use client';
import { Book, CheckCircle, Clock, Upload, XCircle } from 'lucide-react';
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
import Link from 'next/link';
import { useRole } from '@/context/role-context';
import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockLessonNote } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';

export function TeacherDashboard() {
  const { user } = useRole();
  const { toast } = useToast();
  const [notes, setNotes] = useState<MockLessonNote[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'lessonNotes'), where('teacherId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const notesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockLessonNote));
      setNotes(notesList);

      const total = notesList.length;
      const approved = notesList.filter(n => n.status.includes('Approved')).length;
      const pending = notesList.filter(n => n.status.includes('Pending')).length;
      const rejected = notesList.filter(n => n.status.includes('Rejected')).length;
      setStats({ total, approved, pending, rejected });

    } catch (error) {
      console.error("Error fetching lesson notes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch your lesson notes.",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);


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
          Welcome, {user?.displayName || 'Teacher'}. Manage your lesson notes and performance data.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">notes submitted this term</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Notes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">notes approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Notes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Notes</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
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
              {notes.map((note) => (
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
              {notes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No notes found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
