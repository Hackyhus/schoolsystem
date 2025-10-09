
'use client';
import {
  BookCopy,
  CheckCircle,
  Clock,
  Users,
  XCircle,
  BarChart,
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
import { db, dbService } from '@/lib/firebase';
import type { MockLessonNote, MockUser } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/context/role-context';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { format } from 'date-fns';


type SubmissionStatusData = {
  name: string;
  value: number;
  fill: string;
};

type LessonNoteWithDate = Omit<MockLessonNote, 'submissionDate' | 'submittedOn'> & {
  submissionDate: string | { seconds: number; nanoseconds: number; }; // Keep original for type safety
  submittedOn?: any;
  formattedDate: string;
};

export function HodDashboard() {
  const { user } = useRole();
  const { toast } = useToast();
  const [notes, setNotes] = useState<LessonNoteWithDate[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    staffCount: 0,
  });
  const [submissionStatusData, setSubmissionStatusData] = useState<SubmissionStatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const hodUser = await dbService.getDoc<MockUser>('users', user.uid);
      if (!hodUser || !hodUser.department) {
        toast({ title: "Error", description: "Could not determine your department." });
        setIsLoading(false);
        return;
      }

      // Get all teachers in that department
      const departmentTeachers = await dbService.getDocs<MockUser>('users', [
        { type: 'where', fieldPath: 'department', opStr: '==', value: hodUser.department },
        { type: 'where', fieldPath: 'role', opStr: '==', value: 'Teacher' },
      ]);
      const teacherIds = departmentTeachers.map(t => t.id);

      if (teacherIds.length === 0) {
        setStats({ pending: 0, approved: 0, rejected: 0, staffCount: 0 });
        setNotes([]);
        setIsLoading(false);
        return;
      }

      const notesQuery = query(collection(db, 'lessonNotes'), where('teacherId', 'in', teacherIds));
      const notesSnapshot = await getDocs(notesQuery);
      
      const notesList = notesSnapshot.docs.map(doc => {
        const data = doc.data() as MockLessonNote;
        let formattedDate = 'Invalid Date';
        try {
          const dateSource = data.submittedOn?.seconds ? new Date(data.submittedOn.seconds * 1000) : (typeof data.submissionDate === 'string' ? new Date(data.submissionDate) : null);
          if (dateSource && !isNaN(dateSource.getTime())) {
              formattedDate = format(dateSource, 'PPP');
          }
        } catch(e) {
            console.warn(`Could not parse date for note ${doc.id}:`, data.submittedOn || data.submissionDate);
        }

        return { 
            id: doc.id, 
            ...data,
            formattedDate: formattedDate
        } as LessonNoteWithDate;
      });

      // Sort client-side
      notesList.sort((a, b) => {
          const dateA = a.submittedOn?.seconds ? new Date(a.submittedOn.seconds * 1000) : new Date(a.submissionDate);
          const dateB = b.submittedOn?.seconds ? new Date(b.submittedOn.seconds * 1000) : new Date(b.submissionDate);
          return dateB.getTime() - dateA.getTime();
      });

      setNotes(notesList.slice(0, 5)); // Show recent 5

      const approved = notesList.filter(n => n.status === 'Approved').length;
      const pending = notesList.filter(n => n.status.includes('Pending')).length;
      const rejected = notesList.filter(n => n.status.includes('Rejected') || n.status.includes('Revision')).length;
      
      setSubmissionStatusData([
        { name: 'Approved', value: approved, fill: 'hsl(var(--chart-2))' },
        { name: 'Pending', value: pending, fill: 'hsl(var(--chart-4))' },
        { name: 'Rejected', value: rejected, fill: 'hsl(var(--destructive))' },
      ]);

      setStats({
        pending,
        approved,
        rejected,
        staffCount: departmentTeachers.length,
      });

    } catch (error) {
       console.error("Error fetching HOD data:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch dashboard data. Firestore indexes may be required.",
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
  
  const chartConfig = {
    approved: { label: 'Approved', color: 'hsl(var(--chart-2))' },
    pending: { label: 'Pending', color: 'hsl(var(--chart-4))' },
    rejected: { label: 'Rejected', color: 'hsl(var(--destructive))' },
  };

  const totalNotes = stats.approved + stats.pending + stats.rejected;

  return (
    <div className="flex flex-col gap-6">
       <div className="space-y-1">
        <h1 className="font-headline text-2xl md:text-3xl font-bold">HOD Dashboard</h1>
        <p className="text-muted-foreground">
          Department Overview & Approval Queue
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className='w-10 h-8'/> : stats.pending}</div>
            <p className="text-xs text-muted-foreground">notes awaiting your approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Approved Notes</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className='w-10 h-8'/> : stats.approved}</div>
             <p className="text-xs text-muted-foreground">total notes approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Returned Notes</CardTitle>
            <XCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className='w-10 h-8'/> : stats.rejected}</div>
            <p className="text-xs text-muted-foreground">for revision or rejected</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Department Staff</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
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
                        <TableHead className="hidden sm:table-cell">Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? Array.from({length: 3}).map((_, i) => (
                           <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                           </TableRow>
                        )) : notes.length > 0 ? notes.map((note) => (
                        <TableRow key={note.id}>
                            <TableCell>
                            <div className="font-medium">{note.teacherName}</div>
                            <div className="text-sm text-muted-foreground hidden md:table-cell">{note.title}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{note.subject}</TableCell>
                            <TableCell>
                            <Badge variant={statusVariant(note.status)}>{note.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/dashboard/lesson-notes/${note.id}`}>Review</Link>
                            </Button>
                            </TableCell>
                        </TableRow>
                        )) : (
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
                    <CardTitle>Department Submission Status</CardTitle>
                    <CardDescription>Overview of lesson note statuses in your department.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? ( <Skeleton className="h-[250px] w-full" /> ) : totalNotes > 0 ? (
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Pie data={submissionStatusData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                    {submissionStatusData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent className="flex-wrap" nameKey="name" />} />
                            </PieChart>
                        </ChartContainer>
                    ) : (
                         <div className="flex h-[250px] items-center justify-center text-center text-muted-foreground">
                            <p>No submission data available.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
