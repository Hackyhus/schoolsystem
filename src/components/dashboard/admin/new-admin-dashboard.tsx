
'use client';
import {
  Users,
  CalendarDays,
  BookUser,
  Clock,
  Activity,
  GraduationCap,
  TrendingUp,
  BookCheck,
  FileWarning,
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
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockUser, MockLessonNote } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

type SubmissionStatusData = {
  name: string;
  value: number;
  fill: string;
};

type MonthlySubmissionsData = {
  month: string;
  submissions: number;
};

export function NewAdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [teachers, setTeachers] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionStatusData, setSubmissionStatusData] = useState<
    SubmissionStatusData[]
  >([]);
  const [monthlySubmissions, setMonthlySubmissions] = useState<
    MonthlySubmissionsData[]
  >([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // User counts
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'Student')
      );
      const teachersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'Teacher')
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const teachersSnapshot = await getDocs(teachersQuery);
      const teacherList = teachersSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MockUser)
      );

      // Lesson note stats and charts
      const lessonNotesQuery = query(collection(db, 'lessonNotes'));
      const lessonNotesSnapshot = await getDocs(lessonNotesQuery);
      const notes = lessonNotesSnapshot.docs.map(
        (doc) => doc.data() as MockLessonNote
      );

      const approved = notes.filter((n) =>
        n.status.includes('Approved')
      ).length;
      const pending = notes.filter((n) => n.status.includes('Pending')).length;
      const rejected = notes.filter(
        (n) => n.status.includes('Rejected') || n.status.includes('Revision')
      ).length;

      setStats({
        students: studentsSnapshot.size,
        teachers: teachersSnapshot.size,
        pending,
        approved,
        rejected,
      });

      setTeachers(teacherList);

      // Prepare data for status donut chart
      setSubmissionStatusData([
        {
          name: 'Approved',
          value: approved,
          fill: 'hsl(var(--chart-2))',
        },
        {
          name: 'Pending',
          value: pending,
          fill: 'hsl(var(--chart-4))',
        },
        {
          name: 'Needs Revision',
          value: rejected,
          fill: 'hsl(var(--destructive))',
        },
      ]);

      // Prepare data for monthly submissions area chart
      const monthCounts: Record<string, number> = {};
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      monthNames.forEach((m) => (monthCounts[m] = 0));

      notes.forEach((note) => {
        const date = new Date(note.submissionDate);
        const month = monthNames[date.getMonth()];
        if (month) {
          monthCounts[month]++;
        }
      });

      setMonthlySubmissions(
        monthNames.map((month) => ({
          month,
          submissions: monthCounts[month] || 0,
        }))
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch dashboard data.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartConfig = {
    submissions: {
      label: 'Submissions',
      color: 'hsl(var(--primary))',
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
      label: 'Needs Revision',
      color: 'hsl(var(--destructive))',
    },
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, Admin
        </h1>
        <p className="text-gray-600">
          Here is what is happening at Great Insight International Academy
          today.
        </p>
      </div>
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Students
            </CardTitle>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <GraduationCap className=" text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats.students}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Staff
            </CardTitle>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <BookUser className="text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats.teachers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Approvals
            </CardTitle>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              System Health
            </CardTitle>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Activity className="text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Note Submissions by Month</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] w-full"
                >
                  <AreaChart
                    accessibilityLayer
                    data={monthlySubmissions}
                    margin={{ left: 12, right: 12, top: 5 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <defs>
                      <linearGradient
                        id="fillSubmissions"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-submissions)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-submissions)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      dataKey="submissions"
                      type="natural"
                      fill="url(#fillSubmissions)"
                      fillOpacity={0.4}
                      stroke="var(--color-submissions)"
                      stackId="a"
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Teacher Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-16" />
                          </TableCell>
                        </TableRow>
                      ))
                    : teachers.slice(0, 4).map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell>{teacher.name}</TableCell>
                          <TableCell>{teacher.department}</TableCell>
                          <TableCell>{teacher.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                teacher.status === 'Active'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {teacher.status || 'Active'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Status</CardTitle>
              <CardDescription>
                Overview of all lesson notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={submissionStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {submissionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                    />
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>School Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
