
'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BookCheck, Clock, FileWarning, TrendingUp } from 'lucide-react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import type { MockLessonNote } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';


export default function ReportsPage() {
  const [notes, setNotes] = useState<MockLessonNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      const notesQuery = query(collection(db, 'lessonNotes'));
      const querySnapshot = await getDocs(notesQuery);
      const notesList = querySnapshot.docs.map(doc => doc.data() as MockLessonNote);
      setNotes(notesList);
      setIsLoading(false);
    };
    fetchNotes();
  }, []);

  const totalNotes = notes.length;
  const approvedCount = totalNotes > 0 ? notes.filter(n => n.status.includes('Approved')).length : 0;
  const pendingCount = totalNotes > 0 ? notes.filter(n => n.status.includes('Pending')).length : 0;
  const rejectedCount = totalNotes > 0 ? notes.filter(n => n.status.includes('Rejected')).length : 0;

  const submissionStatusData = [
    { name: 'Approved', value: approvedCount, fill: 'var(--color-approved)' },
    { name: 'Pending', value: pendingCount, fill: 'var(--color-pending)' },
    { name: 'Rejected', value: rejectedCount, fill: 'var(--color-rejected)' },
  ];
  const chartConfig = {
    value: {
      label: 'Count',
    },
     approved: {
      label: 'Approved',
      color: 'hsl(var(--chart-2))',
    },
    pending: {
      label: 'Pending',
      color: 'hsl(var(--chart-4))',
    },
    rejected: {
      label: 'Rejected',
      color: 'hsl(var(--destructive))',
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Analyze school-wide data and generate reports.
        </p>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{totalNotes}</div>}
            <p className="text-xs text-muted-foreground">
              lesson notes this term
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <BookCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{approvedCount}</div>}
            <p className="text-xs text-muted-foreground">
              {totalNotes > 0 ? ((approvedCount / totalNotes) * 100).toFixed(0) : 0}% approval rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{pendingCount}</div>}
            <p className="text-xs text-muted-foreground">
              awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{rejectedCount}</div>}
            <p className="text-xs text-muted-foreground">
             {totalNotes > 0 ? ((rejectedCount / totalNotes) * 100).toFixed(0) : 0}% rejection rate
            </p>
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Lesson Note Submission Status</CardTitle>
          <CardDescription>
            A summary of all lesson note submissions by their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-[200px] w-full" /> : (totalNotes > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="h-[200px] w-full"
            >
              <ResponsiveContainer>
                <BarChart
                  data={submissionStatusData}
                  layout="vertical"
                  margin={{ left: 10, right: 10 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={80}
                  />
                  <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="value" radius={5} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No data to display.
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
