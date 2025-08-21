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
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AddExamQuestionForm } from '@/components/dashboard/exam-questions/add-exam-question-form';
import { format } from 'date-fns';

type ExamQuestion = {
    id: string;
    subject: string;
    class: string;
    status: string;
    submittedOn: { seconds: number; nanoseconds: number; }; // Firestore Timestamp
    teacherName: string;
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
        let q;
        if (role === 'Teacher') {
            q = query(collection(db, 'examQuestions'), where("teacherId", "==", user.uid), orderBy("submittedOn", "desc"));
        } else {
            // Exam Officer or Admin sees all
            q = query(collection(db, 'examQuestions'), orderBy("submittedOn", "desc"));
        }
        const querySnapshot = await getDocs(q);
        const questionList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamQuestion));
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

  const handleQuestionAdded = () => {
    fetchQuestions();
    setIsModalOpen(false);
  }

  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };

  const getActionText = () => {
    if (role === 'Teacher') return 'View';
    if (role === 'ExamOfficer') return 'Review';
    return 'View';
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
                  <Upload className="mr-2 h-4 w-4" /> Upload Questions
                </Button>
              </DialogTrigger>
              <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Upload Exam Questions</DialogTitle>
                    <DialogDescription>
                      Select the class, subject, and upload your questions file. This will be sent to the Exam Officer for review.
                    </DialogDescription>
                 </DialogHeader>
                 <AddExamQuestionForm onQuestionAdded={handleQuestionAdded} />
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
                 {role !== 'Teacher' && <TableHead>Teacher</TableHead>}
                <TableHead>Submitted On</TableHead>
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
                      {role !== 'Teacher' && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
              ) : questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.subject}</TableCell>
                  <TableCell>{q.class}</TableCell>
                   {role !== 'Teacher' && <TableCell>{q.teacherName}</TableCell>}
                  <TableCell>{format(new Date(q.submittedOn.seconds * 1000), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(q.status)}>{q.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                       {/* This will link to a dynamic page later */}
                      <Link href="#">{getActionText()}</Link>
                    </Button>
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
