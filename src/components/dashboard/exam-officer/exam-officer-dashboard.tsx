
'use client';
import {
  Book,
  CheckSquare,
  Clock,
  FileQuestion,
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
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/context/role-context';
import { Skeleton } from '@/components/ui/skeleton';

type ExamQuestion = {
    id: string;
    subject: string;
    class: string;
    status: string;
    teacherName: string;
}

export function ExamOfficerDashboard() {
  const { user } = useRole();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [stats, setStats] = useState({
    subjects: 15, // Placeholder
    teachers: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const questionsQuery = query(collection(db, 'examQuestions'), where('status', '==', 'Pending Review'), orderBy('submittedOn', 'desc'));
      const questionsSnapshot = await getDocs(questionsQuery);
      const questionsList = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamQuestion));
      setQuestions(questionsList.slice(0, 5)); 

      const teachersQuery = query(collection(db, 'users'), where('role', '==', 'Teacher'));
      const teachersSnapshot = await getDocs(teachersQuery);
      
      setStats({
        subjects: 15, // Replace with actual logic later
        teachers: teachersSnapshot.size,
        pending: questionsList.length,
      });

    } catch (error) {
       console.error("Error fetching Exam Officer data:", error);
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
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="flex flex-col gap-6">
       <div>
        <h1 className="font-headline text-3xl font-bold">Exam Officer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage academic assessments, from question review to final results.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <Book className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className='w-10 h-8'/> : stats.subjects}</div>
            <p className="text-xs text-muted-foreground">subjects offered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className='w-10 h-8'/> : stats.teachers}</div>
             <p className="text-xs text-muted-foreground">currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{isLoading ? <Skeleton className='w-10 h-8'/> : stats.pending}</div>
             <p className="text-xs text-muted-foreground">questions & scores</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1">
        <Card>
            <CardHeader>
                <CardTitle>Exam Question Review</CardTitle>
                <CardDescription>Review and approve exam questions from teachers.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject & Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({length: 3}).map((_, i) => (
                           <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                           </TableRow>
                        ))
                    ): questions.map((q) => (
                    <TableRow key={q.id}>
                        <TableCell>
                           <div className="font-medium">{q.teacherName}</div>
                        </TableCell>
                        <TableCell>
                          <div>{q.subject}</div>
                          <div className="text-sm text-muted-foreground">{q.class}</div>
                        </TableCell>
                        <TableCell>
                        <Badge variant={statusVariant(q.status)}>{q.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                           <Link href="/dashboard/exam-questions">Review</Link>
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                    {!isLoading && questions.length === 0 && (
                        <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">No questions in the queue.</TableCell>
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
