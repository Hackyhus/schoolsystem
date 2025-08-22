
'use client';
import { Book, CheckCircle, Clock, FileQuestion, Upload, XCircle } from 'lucide-react';
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
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockLessonNote } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddLessonNoteForm } from '../lesson-notes/add-lesson-note-form';

export function TeacherDashboard() {
  const { user } = useRole();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    pendingPlans: 0,
    approvedPlans: 0,
    rejectedPlans: 0,
    pendingExams: 0,
  });
  const [recentNotes, setRecentNotes] = useState<MockLessonNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch lesson notes
      const notesQuery = query(collection(db, 'lessonNotes'), where('teacherId', '==', user.uid));
      const notesSnapshot = await getDocs(notesQuery);
      const notesList = notesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data() as MockLessonNote}));
      
      // Sort client-side to avoid index errors
      notesList.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
      
      setRecentNotes(notesList.slice(0, 3));
      
      // Fetch exam questions
      const examsQuery = query(collection(db, 'examQuestions'), where('teacherId', '==', user.uid), where('status', '==', 'Pending Review'));
      const examsSnapshot = await getDocs(examsQuery);

      setStats({
        pendingPlans: notesList.filter(n => n.status.includes('Pending')).length,
        approvedPlans: notesList.filter(n => n.status.includes('Approved')).length,
        rejectedPlans: notesList.filter(n => n.status.includes('Rejected') || n.status.includes('Revision')).length,
        pendingExams: examsSnapshot.size,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch your dashboard data.",
      });
    } finally {
        setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmissionAdded = () => {
    fetchData();
    setIsModalOpen(false);
  }

  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected') || status.includes('Revision')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {user?.displayName || 'Teacher'}. Manage your submissions and data.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Plans</CardTitle>
            <Clock className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.pendingPlans}</div>
            <p className="text-xs text-muted-foreground">Lesson plans awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Plans</CardTitle>
            <CheckCircle className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.approvedPlans}</div>
             <p className="text-xs text-muted-foreground">Total plans approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Questions</CardTitle>
            <FileQuestion className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.pendingExams}</div>
            <p className="text-xs text-muted-foreground">Exam questions awaiting review</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected/Revision</CardTitle>
            <XCircle className="h-6 w-6 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.rejectedPlans}</div>
            <p className="text-xs text-muted-foreground">Plans returned for correction</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Lesson Plan Submissions</CardTitle>
                    <CardDescription>
                    Track the status of your recent uploads.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!isLoading && recentNotes.length > 0 ? recentNotes.map((note) => (
                        <TableRow key={note.id}>
                            <TableCell className="font-medium">{note.title}</TableCell>
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
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    {isLoading ? "Loading submissions..." : "No recent submissions."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Jump right into your tasks.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                     <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                           <Button size="lg">
                             <Upload className="mr-2"/> Upload Document
                           </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload Document</DialogTitle>
                                <DialogDescription>
                                Select the class, subject, document type, and upload your file. It will be routed to the correct reviewer.
                                </DialogDescription>
                            </DialogHeader>
                            <AddLessonNoteForm onNoteAdded={handleSubmissionAdded} />
                        </DialogContent>
                    </Dialog>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/dashboard/scores">
                            Enter Student Scores
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
