
'use client';
import {
  BookCopy,
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
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockLessonNote, MockUser } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/context/role-context';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // In a real app, these queries would be scoped by the HOD's department.
      // For now, we fetch all relevant data to demonstrate the UI.
      const notesQuery = query(collection(db, 'lessonNotes'), orderBy('submissionDate', 'desc'));
      const notesSnapshot = await getDocs(notesQuery);
      const notesList = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockLessonNote));
      setNotes(notesList.slice(0, 5)); // Show recent 5

      const approved = notesList.filter(n => n.status === 'Approved').length;
      const pending = notesList.filter(n => n.status.includes('Pending')).length;
      const rejected = notesList.filter(n => n.status.includes('Rejected') || n.status.includes('Revision')).length;

      // In a real app, this should filter by the HOD's department
      const staffQuery = query(collection(db, 'users'), where('role', '==', 'Teacher'));
      const staffSnapshot = await getDocs(staffQuery);
      const staffList = staffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as MockUser));
      setStaff(staffList.slice(0, 5));
      
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
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected') || status.includes('Revision')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="font-headline text-3xl font-bold">HOD Dashboard</h1>
        <p className="text-muted-foreground">
          Department Overview & Approval Queue
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className='w-10 h-8'/> : stats.pending}</div>
            <p className="text-xs text-muted-foreground">notes awaiting your approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Notes</CardTitle>
            <CheckCircle className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className='w-10 h-8'/> : stats.approved}</div>
             <p className="text-xs text-muted-foreground">total notes approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Returned Notes</CardTitle>
            <XCircle className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className='w-10 h-8'/> : stats.rejected}</div>
            <p className="text-xs text-muted-foreground">for revision or rejected</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Department Staff</CardTitle>
            <Users className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className='w-10 h-8'/> : stats.staffCount}</div>
            <p className="text-xs text-muted-foreground">teachers in your department</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Lesson Plan Approval Queue</CardTitle>
                    <CardDescription>Review and approve lesson plans from your department.</CardDescription>
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
                        {isLoading ? Array.from({length: 3}).map((_, i) => (
                           <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                           </TableRow>
                        )) : notes.map((note) => (
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
                        {!isLoading && notes.length === 0 && (
                            <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">No lesson plans in the queue.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Department Staff</CardTitle>
                    <CardDescription>Teachers in your department.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? Array.from({length: 3}).map((_, i) => (
                           <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                           </TableRow>
                        )) : staff.map((s) => (
                            <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell>{s.email}</TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && staff.length === 0 && (
                            <TableRow>
                            <TableCell colSpan={2} className="h-24 text-center">No staff found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
