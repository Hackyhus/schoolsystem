
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  BookUser,
  BarChart2,
  DollarSign,
  TrendingUp,
  Clock,
  BookCopy,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback } from 'react';
import { dbService } from '@/lib/dbService';
import type { MockUser, Student, Payment, Expense, MockLessonNote } from '@/lib/schema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

type DashboardStats = {
    totalStudents: number;
    totalStaff: number;
    termRevenue: number;
    pendingApprovals: number;
};

type SubmissionStatus = {
    name: string;
    'Lesson Plans': number;
    'Exam Questions': number;
};

type FinancialData = {
    name: string;
    revenue: number;
    expenses: number;
};

export default function SltPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [recentNotes, setRecentNotes] = useState<MockLessonNote[]>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [studentCount, staffCount, payments, expenses, lessonNotes, examQuestions] = await Promise.all([
            dbService.getCountFromServer('students', [{ type: 'where', fieldPath: 'status', opStr: '==', value: 'Active' }]),
            dbService.getCountFromServer('users', [{ type: 'where', fieldPath: 'status', opStr: '==', value: 'active' }]),
            dbService.getDocs<Payment>('payments'),
            dbService.getDocs<Expense>('expenses'),
            dbService.getDocs<MockLessonNote>('lessonNotes'),
            dbService.getDocs<MockLessonNote>('examQuestions'),
        ]);

        const termRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        const pendingLessonNotes = lessonNotes.filter(n => n.status.includes('Pending')).length;
        const pendingExamQuestions = examQuestions.filter(q => q.status.includes('Pending')).length;
        
        setStats({
            totalStudents: studentCount,
            totalStaff: staffCount,
            termRevenue: termRevenue,
            pendingApprovals: pendingLessonNotes + pendingExamQuestions,
        });

        const approvedNotes = lessonNotes.length - pendingLessonNotes;
        const approvedQuestions = examQuestions.length - pendingExamQuestions;

        setSubmissionStatus([
            { name: 'Pending', 'Lesson Plans': pendingLessonNotes, 'Exam Questions': pendingExamQuestions },
            { name: 'Approved', 'Lesson Plans': approvedNotes, 'Exam Questions': approvedQuestions }
        ]);

        // This is a simplified view. A real-world scenario would group by month.
        setFinancialData([
            { name: 'This Term', revenue: termRevenue, expenses: totalExpenses }
        ]);
        
        const sortedNotes = lessonNotes.sort((a,b) => (b.submittedOn?.seconds || 0) - (a.submittedOn?.seconds || 0));
        setRecentNotes(sortedNotes.slice(0, 5));

    } catch (error) {
      console.error("Failed to fetch SLT dashboard data:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load dashboard data.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderStat = (value: number | undefined, isCurrency = false) => {
    if (isLoading || value === undefined) return <Skeleton className="h-8 w-16" />;
    if (isCurrency) return `NGN ${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">SLT Dashboard</h1>
        <p className="text-muted-foreground">
          High-level academic and operational oversight.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderStat(stats?.totalStudents)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <BookUser className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderStat(stats?.totalStaff)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {renderStat(stats?.pendingApprovals)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fees Collected (Term)</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderStat(stats?.termRevenue, true)}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Lesson Plan Submissions</CardTitle>
            <CardDescription>A summary of the latest lesson plans submitted for review.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                           <TableRow key={i}>
                                <TableCell colSpan={4}><Skeleton className="h-6 w-full"/></TableCell>
                           </TableRow>
                        ))
                    ) : recentNotes.length > 0 ? (
                        recentNotes.map(note => (
                            <TableRow key={note.id}>
                                <TableCell>{note.teacherName}</TableCell>
                                <TableCell>{note.subject}</TableCell>
                                <TableCell><Badge variant={statusVariant(note.status)}>{note.status}</Badge></TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {note.submittedOn ? formatDistanceToNow(new Date(note.submittedOn.seconds * 1000), { addSuffix: true }) : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">No recent submissions.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Academic Submissions</CardTitle>
                <CardDescription>A comparison of pending vs. approved documents.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="w-full h-64">
                    <ResponsiveContainer>
                        <BarChart data={submissionStatus} layout="vertical" margin={{ left: 10 }}>
                             <CartesianGrid horizontal={false} />
                            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
                            <XAxis type="number" hide />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="Lesson Plans" fill="hsl(var(--chart-1))" radius={4} stackId="a" />
                            <Bar dataKey="Exam Questions" fill="hsl(var(--chart-2))" radius={4} stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
