
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
  CalendarCheck
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
import { collection, getDocs, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockUser, MockLessonNote, Student } from '@/lib/schema';
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

type UserRoleData = {
  name: string;
  value: number;
  fill: string;
}

type EnrollmentData = {
  name: string;
  total: number;
}

const financeData = [
    { name: 'Paid', value: 400, fill: 'hsl(var(--chart-2))' },
    { name: 'Unpaid', value: 150, fill: 'hsl(var(--destructive))' },
    { name: 'Overdue', value: 50, fill: 'hsl(var(--chart-4))' },
]

const attendanceData = [
  { month: 'Jan', attendance: 95 },
  { month: 'Feb', attendance: 92 },
  { month: 'Mar', attendance: 97 },
  { month: 'Apr', attendance: 94 },
  { month: 'May', attendance: 98 },
]


export function NewAdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentStaff, setRecentStaff] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionStatusData, setSubmissionStatusData] = useState<
    SubmissionStatusData[]
  >([]);
    const [userRoleData, setUserRoleData] = useState<UserRoleData[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [monthlySubmissions, setMonthlySubmissions] = useState<
    MonthlySubmissionsData[]
  >([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // User counts and roles
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs.map(doc => doc.data() as MockUser);
      
      const students = allUsers.filter(u => u.role === 'Student');
      const staffList = allUsers.filter(u => u.role !== 'Student' && u.role !== 'Parent');

      const rolesCount: Record<string, number> = {};
      allUsers.forEach(user => {
        rolesCount[user.role] = (rolesCount[user.role] || 0) + 1;
      });
      
      const roleColors = {
        Admin: 'hsl(var(--chart-1))',
        Teacher: 'hsl(var(--chart-2))',
        HeadOfDepartment: 'hsl(var(--chart-3))',
        Parent: 'hsl(var(--chart-4))',
        ExamOfficer: 'hsl(var(--chart-5))',
        Student: 'hsl(var(--muted))',
      };

      setUserRoleData(Object.entries(rolesCount).map(([name, value], i) => ({
        name,
        value,
        fill: (roleColors as any)[name] || `hsl(var(--chart-${(i % 5) + 1}))`,
      })));


      // Student enrollment
      const studentsCollection = collection(db, 'students');
      const studentsDocs = await getDocs(studentsCollection);
      const studentData = studentsDocs.docs.map(d => d.data() as Student);
      
      const enrollmentCounts: Record<string, number> = {};
       studentData.forEach(student => {
        enrollmentCounts[student.classLevel] = (enrollmentCounts[student.classLevel] || 0) + 1;
      });
       setEnrollmentData(Object.entries(enrollmentCounts).map(([name, total]) => ({ name, total })));


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
        students: studentData.length,
        staff: staffList.length,
        pending,
        approved,
        rejected,
      });

      setRecentStaff(staffList);

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
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
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
    submissions: { label: 'Submissions', color: 'hsl(var(--primary))' },
    approved: { label: 'Approved', color: 'hsl(var(--chart-2))' },
    pending: { label: 'Pending', color: 'hsl(var(--chart-4))' },
    rejected: { label: 'Needs Revision', color: 'hsl(var(--destructive))' },
    students: { label: 'Students', color: 'hsl(var(--chart-1))'},
    users: { label: 'Users' }
  };
  
   const userRoleChartConfig = userRoleData.reduce((acc, { name, fill }) => {
    (acc as any)[name] = { label: name, color: fill };
    return acc;
  }, { users: { label: 'Users' } });
  
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

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.students}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Staff
            </CardTitle>
            <BookUser className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.staff}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.pending}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lesson Note Stats</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-sm text-muted-foreground">
                <p>Approved: {stats.approved}</p>
                <p>Pending: {stats.pending}</p>
                <p>Rejected: {stats.rejected}</p>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
           <Card>
            <CardHeader>
                <CardTitle>Student Enrollment by Class</CardTitle>
                <CardDescription>A breakdown of student population in each class.</CardDescription>
            </CardHeader>
            <CardContent>
               {isLoading ? ( <Skeleton className="h-[250px] w-full" /> ) : enrollmentData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart data={enrollmentData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="total" fill="var(--color-students)" radius={4} />
                    </BarChart>
                </ChartContainer>
               ) : (
                <div className="flex h-[250px] items-center justify-center text-center text-muted-foreground">
                    <p>No student enrollment data available.</p>
                </div>
               )}
            </CardContent>
           </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lesson Note Submissions by Month</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? ( <Skeleton className="h-[250px] w-full" /> ) : totalNotes > 0 ? (
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
              ) : (
                 <div className="flex h-[250px] items-center justify-center text-center text-muted-foreground">
                    <p>No lesson note submission data to display.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign /> Finance & Fees Summary</CardTitle>
                    <CardDescription>A summary of termly fee payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie data={financeData} dataKey="value" nameKey="name" innerRadius={50} />
                            <ChartLegend content={<ChartLegendContent className="flex-wrap" nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarCheck /> Attendance Statistics</CardTitle>
                    <CardDescription>School-wide attendance trend this term.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{ attendance: { label: 'Attendance', color: 'hsl(var(--chart-3))' } }} className="h-[200px] w-full">
                        <AreaChart data={attendanceData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <YAxis domain={[80, 100]} tickFormatter={(value) => `${value}%`} />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Area dataKey="attendance" type="natural" fill="var(--color-attendance)" fillOpacity={0.4} stroke="var(--color-attendance)" />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>
                Distribution of user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? ( <Skeleton className="h-[250px] w-full" /> ) : userRoleData.length > 0 ? (
                <ChartContainer
                  config={userRoleChartConfig}
                  className="mx-auto aspect-square h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={userRoleData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                       {userRoleData.map((entry) => (
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
                    <p>No user data to display.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Submission Status</CardTitle>
              <CardDescription>
                Overview of all lesson notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? ( <Skeleton className="h-[250px] w-full" /> ) : totalNotes > 0 ? (
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
              <CardDescription>A list of recently added staff members.</CardDescription>
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
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={`skeleton-staff-${i}`}>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                        </TableRow>
                      ))
                    : recentStaff.slice(0, 4).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
