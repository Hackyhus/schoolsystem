'use client';
import {
  BookCheck,
  CheckCircle,
  Clock,
  Users,
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
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockLessonNote, MockUser } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/context/role-context';

export function HodDashboard() {
  const { user } = useRole();
  const { toast } = useToast();
  const [notes, setNotes] = useState<MockLessonNote[]>([]);
  const [staff, setStaff] = useState<MockUser[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    staffCount: 0,
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      // For now, HOD sees all notes. This can be scoped by department later.
      const notesQuery = query(collection(db, 'lessonNotes'));
      const notesSnapshot = await getDocs(notesQuery);
      const notesList = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockLessonNote));
      setNotes(notesList);

      const approved = notesList.filter(n => n.status === 'Approved').length;
      const pending = notesList.filter(n => n.status.includes('Pending')).length;
      const rejected = notesList.filter(n => n.status.includes('Rejected')).length;

      // This should be scoped by department in a real app
      const staffQuery = query(collection(db, 'users'), where('role', '==', 'Teacher'));
      const staffSnapshot = await getDocs(staffQuery);
      const staffList = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as MockUser));
      setStaff(staffList);
      
      setStats({
        pending,
        approved,
        rejected,
        staffCount: staffList.length,
      });

    } catch (error) {
       console.error("Error fetching HOD data:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch dashboard data.",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">HOD Dashboard</h1>
        <p className="text-muted-foreground">
          Department Overview
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">notes awaiting your approval</p>
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
            <CardTitle className="text-sm font-medium">Rejected Notes</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">notes returned for revision</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.staffCount}</div>
            <p className="text-xs text-muted-foreground">teachers in your department</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Note Approval Queue</CardTitle>
            <CardDescription>
              Review and approve lesson notes from your department.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell>
                      <div className="font-medium">{note.teacherName}</div>
                      <div className="text-sm text-muted-foreground">{note.title}</div>
                    </TableCell>
                    <TableCell>{note.subject}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(note.status)}>{note.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/lesson-notes/${note.id}`}>Review</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {notes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">No notes in the queue.</TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Department Staff</CardTitle>
            <CardDescription>View and manage teachers in your department.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                       <TableCell><Badge variant="outline">{s.role}</Badge></TableCell>
                    </TableRow>
                ))}
                 {staff.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">No staff found.</TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
