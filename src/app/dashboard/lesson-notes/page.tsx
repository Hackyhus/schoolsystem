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
import Link from 'next/link';
import { useRole } from '@/context/role-context';
import { Upload } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockLessonNote } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';


export default function LessonNotesPage() {
  const { role, user } = useRole();
  const [notes, setNotes] = useState<MockLessonNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!user && role !== 'Admin' && role !== 'HeadOfDepartment') {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      let notesQuery;
      if (role === 'Teacher') {
        notesQuery = query(collection(db, 'lessonNotes'), where("teacherId", "==", user?.uid));
      } else {
        // Admin and HOD see all for now. This could be scoped by department for HODs.
        notesQuery = query(collection(db, 'lessonNotes'));
      }
      
      const querySnapshot = await getDocs(notesQuery);
      const notesList = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MockLessonNote)
      );
      setNotes(notesList);
    } catch (error) {
      console.error("Error fetching lesson notes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch lesson notes.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, role, toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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

  const handleNoteAdded = () => {
    fetchNotes();
    setIsModalOpen(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Lesson Plans</h1>
        <p className="text-muted-foreground">
          {role === 'Teacher' ? 'Manage and track your lesson plan submissions.' : 'Review and manage all lesson plans.'}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Submissions</CardTitle>
            <CardDescription>
              A complete list of all lesson plans.
            </CardDescription>
          </div>
          {role === 'Teacher' && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" /> Upload New Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Upload Lesson Plan</DialogTitle>
                    <DialogDescription>
                      Select the class, subject, and upload your lesson plan file.
                    </DialogDescription>
                 </DialogHeader>
                 {/* Add form component here */}
                 <p className="text-center text-muted-foreground py-8">Lesson plan upload form will be here.</p>
              </DialogContent>
            </Dialog>
            
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
              {isLoading ? (
                 Array.from({ length: 3 }).map((_, i) => (
                   <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                     {role !== 'Teacher' && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                 ))
              ) : notes.map((note) => (
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
               {!isLoading && notes.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={role !== 'Teacher' ? 6: 5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No lesson notes found.
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
