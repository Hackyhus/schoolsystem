
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
import { Upload, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AddLessonNoteForm } from '@/components/dashboard/lesson-notes/add-lesson-note-form'; // Re-using the unified form
import { format } from 'date-fns';
import { dbService } from '@/lib/firebase';
import type { QueryConstraint } from '@/services/types';

type ExamQuestion = {
    id: string;
    subject: string;
    class: string;
    status: string;
    submittedOn: { seconds: number; nanoseconds: number; }; // Firestore Timestamp
    teacherName: string;
    teacherId: string;
    title: string;
}

export default function ExamQuestionsPage() {
  const { role, user } = useRole();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuestions = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        let constraints: QueryConstraint[] = [{ type: 'orderBy', fieldPath: 'submittedOn', direction: 'desc' }];
        
        if (role === 'Teacher') {
            constraints.push({ type: 'where', fieldPath: 'teacherId', opStr: '==', value: user.uid });
        }
        
        const questionList = await dbService.getDocs<ExamQuestion>('examQuestions', constraints);
        setQuestions(questionList);
    } catch (error) {
        console.error("Error fetching exam questions:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch exam questions."
        });
    } finally {
        setIsLoading(false);
    }
  }, [user, role, toast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmissionAdded = () => {
    fetchQuestions();
    setIsModalOpen(false);
  }

  const handleReview = async (question: ExamQuestion, newStatus: 'Approved' | 'Rejected') => {
    try {
        await dbService.updateDoc('examQuestions', question.id, { status: newStatus });
        
        // You would typically create a notification here for the teacher
        // await createNotification(question.teacherId, question.id, question.title, newStatus);
        
        toast({
            title: `Question ${newStatus}`,
            description: "The submission has been updated.",
        });
        fetchQuestions(); // Refresh list
    } catch (error) {
        console.error("Error updating question status:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update the submission.",
        });
    }
  };

  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };

  const getActionButtons = (q: ExamQuestion) => {
     if (role === 'Teacher') {
         return (
             <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/exam-questions/${q.id}`}>View</Link>
             </Button>
         )
     }
     return (
        <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleReview(q, 'Approved')}>
                <ThumbsUp className="mr-2 h-4 w-4" /> Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleReview(q, 'Rejected')}>
                <ThumbsDown className="mr-2 h-4 w-4" /> Reject
            </Button>
        </div>
     );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Test & Exam Questions</h1>
        <p className="text-muted-foreground">
          {role === 'Teacher' ? 'Manage and track your question submissions.' : 'Review and manage all exam questions.'}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Submissions</CardTitle>
            <CardDescription>
              A complete list of all submitted questions.
            </CardDescription>
          </div>
          {role === 'Teacher' && (
             <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" /> Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Select the class, subject, and upload your file. It will be routed to the correct reviewer.
                    </DialogDescription>
                 </DialogHeader>
                 <AddLessonNoteForm onNoteAdded={handleSubmissionAdded} documentType="Exam Question" />
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                 {role !== 'Teacher' && <TableHead className="hidden md:table-cell">Teacher</TableHead>}
                <TableHead className="hidden md:table-cell">Submitted On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      {role !== 'Teacher' && <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>}
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-40" /></TableCell>
                    </TableRow>
                  ))
              ) : questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.subject}</TableCell>
                  <TableCell>{q.class}</TableCell>
                   {role !== 'Teacher' && <TableCell className="hidden md:table-cell">{q.teacherName}</TableCell>}
                  <TableCell className="hidden md:table-cell">{format(new Date(q.submittedOn.seconds * 1000), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(q.status)}>{q.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {getActionButtons(q)}
                  </TableCell>
                </TableRow>
              ))}
               {!isLoading && questions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={role !== 'Teacher' ? 6 : 5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No questions found.
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
