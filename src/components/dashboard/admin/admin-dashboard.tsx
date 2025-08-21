'use client';
import {
  ArrowUpRight,
  BookCheck,
  Clock,
  FileWarning,
  Users,
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
import { collection, getDocs, limit, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockLessonNote, MockUser } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';

export function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    users: 0,
    lessonNotes: 0,
    pendingReviews: 0,
    teachers: 0,
  });
  const [recentNotes, setRecentNotes] = useState<MockLessonNote[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]); // Using any for now

  const fetchData = useCallback(async () => {
    try {
      const usersQuery = collection(db, "users");
      const lessonNotesQuery = collection(db, "lessonNotes");
      
      const usersSnapshot = await getDocs(usersQuery);
      const lessonNotesSnapshot = await getDocs(lessonNotesQuery);

      const pendingReviewsQuery = query(lessonNotesQuery, where("status", "in", ["Pending HOD Approval", "Pending Admin Approval"]));
      const pendingReviewsSnapshot = await getDocs(pendingReviewsQuery);

      const teachersQuery = query(usersQuery, where("role", "==", "Teacher"));
      const teachersSnapshot = await getDocs(teachersQuery);

      setStats({
        users: usersSnapshot.size,
        lessonNotes: lessonNotesSnapshot.size,
        pendingReviews: pendingReviewsSnapshot.size,
        teachers: teachersSnapshot.size,
      });

      const recentNotesQuery = query(collection(db, "lessonNotes"), orderBy("submissionDate", "desc"), limit(4));
      const recentNotesSnapshot = await getDocs(recentNotesQuery);
      const notesList = recentNotesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockLessonNote));
      setRecentNotes(notesList);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch dashboard data.",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const statusVariant = (status: string) => {
    if (status === 'Approved') return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Admin. Here's your school overview.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">total users in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers}</div>
            <p className="text-xs text-muted-foreground">teachers currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lesson Notes</CardTitle>
            <BookCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lessonNotes}</div>
            <p className="text-xs text-muted-foreground">total submissions this term</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">notes awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Lesson Notes</CardTitle>
            <CardDescription>
              Review and approve recently submitted lesson notes.
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
                {recentNotes.map((note) => (
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
                         <Link href={`/dashboard/lesson-notes/${note.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {recentNotes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">No recent notes.</TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>
              Manage and broadcast school-wide announcements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {/* Add dynamic announcements here */}
              <div className="rounded-md border p-4 text-center text-muted-foreground">
                <p>Announcements feature coming soon.</p>
              </div>
            <Button className="w-full">Create New Announcement</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
