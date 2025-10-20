
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
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  BarChart2,
  DollarSign,
  CalendarCheck,
  ArrowUp,
  ArrowDown,
  ThumbsUp,
  ThumbsDown,
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
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  MockUser,
  MockLessonNote,
  Student,
  Payment,
  Expense,
} from '@/lib/schema';
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
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Line,
  LineChart,
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

const financeData = [
  { name: 'Paid', value: 0, fill: 'hsl(var(--chart-2))' },
  { name: 'Unpaid', value: 0, fill: 'hsl(var(--destructive))' },
  { name: 'Overdue', value: 0, fill: 'hsl(var(--chart-4))' },
];

const attendanceData = [
  { month: 'Jan', attendance: 0 },
  { month: 'Feb', attendance: 0 },
  { month: 'Mar', attendance: 0 },
  { month: 'Apr', attendance: 0 },
  { month: 'May', attendance: 0 },
];

export function NewAdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    revenue: 0,
    expenses: 0,
  });
  const [recentStaff, setRecentStaff] = useState<MockUser[]>([]);
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
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MockUser)
      );

      const staffList = allUsers.filter(
        (u) => u.role !== 'Student' && u.role !== 'Parent' && u.staffId
      );

      const studentsCollection = collection(db, 'students');
      const studentsDocs = await getDocs(studentsCollection);
      const studentData = studentsDocs.docs.map((d) => d.data() as Student);

      const lessonNotesQuery = query(collection(db, 'lessonNotes'));
      const lessonNotesSnapshot = await getDocs(lessonNotesQuery);
      const notes = lessonNotesSnapshot.docs.map(
        (doc) => doc.data() as MockLessonNote
      );

      const approved = notes.filter((n) => n.status.includes('Approved')).length;
      const pending = notes.filter((n) => n.status.includes('Pending')).length;
      const rejected = notes.filter(
        (n) => n.status.includes('Rejected') || n.status.includes('Revision')
      ).length;

      // Fetch financial data
      const paymentsQuery = query(collection(db, 'payments'));
      const expensesQuery = query(collection(db, 'expenses'));
      const [paymentsSnapshot, expensesSnapshot] = await Promise.all([
        getDocs(paymentsQuery),
        getDocs(expensesQuery),
      ]);
      const totalRevenue = paymentsSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data() as Payment).amountPaid,
        0
      );
      const totalExpenses = expensesSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data() as Expense).amount,
        0
      );

      setStats({
        students: studentData.length,
        staff: staffList.length,
        pending,
        approved,
        rejected,
        revenue: totalRevenue,
        expenses: totalExpenses,
      });

      setRecentStaff(staffList.slice(0, 5));

      setSubmissionStatusData([
        { name: 'Approved', value: approved, fill: 'hsl(var(--chart-2))' },
        { name: 'Pending', value: pending, fill: 'hsl(var(--chart-4))' },
        {
          name: 'Needs Revision',
          value: rejected,
          fill: 'hsl(var(--destructive))',
        },
      ]);

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
        if (note.submittedOn?.seconds) {
          const date = new Date(note.submittedOn.seconds * 1000);
          if (!isNaN(date.getTime())) {
            const month = monthNames[date.getMonth()];
            if (month) monthCounts[month]++;
          }
        }
      });

      setMonthlySubmissions(
        monthNames.map((month) => ({ month, submissions: monthCounts[month] || 0 }))
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Could not fetch dashboard data. Firestore indexes may be required.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartConfig = {
    submissions: { label: 'Submissions', color: 'hsl(var(--primary))' },
    approved: { label: 'Approved', color: 'hsl(var(--chart-2))' },
    pending: { label: 'Pending', color: 'hsl(var(--chart-4))' },
    rejected: { label: 'Needs Revision', color: 'hsl(var(--destructive))' },
  };

  const totalNotes = stats.approved + stats.pending + stats.rejected;

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, Admin
        </h1>
        <p className="text-muted-foreground">
          Here is what is happening at Great Insight International Academy
          today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.students}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <BookUser className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.staff}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.pending}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lesson Note Stats
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <>
                  <p>Approved: {stats.approved}</p>
                  <p>Pending: {stats.pending}</p>
                  <p>Rejected: {stats.rejected}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission & Approval Stats</CardTitle>
              <CardDescription>
                A high-level overview of lesson note submissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 rounded-lg border p-4 bg-green-50 dark:bg-green-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                  <ThumbsUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {stats.approved.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {stats.pending.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4 bg-red-50 dark:bg-red-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                  <ThumbsDown className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {stats.rejected.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      allowDecimals={false}
                    />
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
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Status</CardTitle>
              <CardDescription>Overview of all lesson notes</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : totalNotes > 0 ? (
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
                      {submissionStatusData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent className="flex-wrap" nameKey="name" />}
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-center text-muted-foreground">
                  <p>No submission data to display.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Staff</CardTitle>
              <CardDescription>
                A list of recently added staff members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={`skeleton-staff-${i}`}>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    recentStaff.map((user) => (
                      <TableRow key={user.staffId}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
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
