
'use client';
import {
  BarChart,
  CalendarCheck,
  Megaphone,
  LineChart as LineChartIcon,
  DollarSign
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
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

// Mock data, to be replaced with live data
const studentPerformance = {
  studentName: 'Adewale Adebayo',
  attendance: [
    { month: 'January', percentage: 95 },
    { month: 'February', percentage: 98 },
  ],
  grades: [
      { subject: 'Mathematics', score: 85, grade: 'A' },
      { subject: 'English', score: 76, grade: 'B' },
  ],
};
const announcements = [
    { id: 1, title: 'Mid-term Break', content: 'School closes for mid-term break on Friday.'}
];

const performanceOverTime = [
  { term: 'Term 1', average: 75 },
  { term: 'Term 2', average: 82 },
  { term: 'Term 3', average: 78 },
];

const feeHistoryData = [
  { name: 'Term 1 Fees', value: 100, fill: 'hsl(var(--chart-2))' },
  { name: 'Term 2 Fees', value: 100, fill: 'hsl(var(--chart-2))' },
  { name: 'Term 3 Fees', value: 0, fill: 'hsl(var(--destructive))' },
];

const chartConfig = {
  average: { label: 'Average %', color: 'hsl(var(--chart-1))' },
  paid: { label: 'Paid', color: 'hsl(var(--chart-2))' },
  unpaid: { label: 'Unpaid', color: 'hsl(var(--destructive))' },
};


export function ParentDashboard() {
  const { studentName, attendance, grades } = studentPerformance;
  const overallAttendance = attendance.length > 0 ? attendance.reduce((acc, month) => acc + month.percentage, 0) / attendance.length : 100;
  const averageGrade = grades.length > 0 ? (grades.reduce((acc, g) => acc+g.score, 0) / grades.length) : 0;


  const gradeColor = (grade: string) => {
    if (grade === 'A') return 'bg-green-500 hover:bg-green-500';
    if (grade === 'B') return 'bg-blue-500 hover:bg-blue-500';
    if (grade === 'C') return 'bg-yellow-500 hover:bg-yellow-500';
    return 'bg-red-500 hover:bg-red-500';
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Parent Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome! Here's a summary of {studentName || "your child"}'s performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <CalendarCheck className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAttendance.toFixed(1)}%</div>
            <Progress value={overallAttendance} className="mt-2 h-2" />
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <BarChart className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.length > 0 ? averageGrade.toFixed(1) : "N/A"}%
            </div>
             <p className="text-xs text-muted-foreground">across all subjects</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Academic Performance Over Time</CardTitle>
                    <CardDescription>Tracking your ward's termly average score.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <LineChart data={performanceOverTime} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="term" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis domain={[60, 100]} tickFormatter={(value) => `${value}%`} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="average" stroke="var(--color-average)" strokeWidth={2} dot={true} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Grades</CardTitle>
                    <CardDescription>
                    A snapshot of {studentName || "your child"}'s latest academic results.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className="text-right">Grade</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grades.length > 0 ? (
                        grades.slice(0, 5).map((g: any) => (
                            <TableRow key={g.subject}>
                            <TableCell className="font-medium">{g.subject}</TableCell>
                            <TableCell>{g.score}</TableCell>
                            <TableCell className="text-right">
                                <Badge className={`text-white ${gradeColor(g.grade)}`}>{g.grade}</Badge>
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                            No grades available yet.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Fee Payment History</CardTitle>
                    <CardDescription>Status of school fee payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie data={feeHistoryData} dataKey="value" nameKey="name" innerRadius={50}>
                                {feeHistoryData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent className="flex-wrap" nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>School Announcements</CardTitle>
                    <CardDescription>
                    Important updates from the school administration.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {announcements.length > 0 ? (
                    announcements.map((ann) => (
                        <div key={ann.id} className="flex items-start gap-4 rounded-md border p-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{ann.title}</h3>
                            <p className="text-sm text-muted-foreground">{ann.content}</p>
                        </div>
                        </div>
                    ))
                    ) : (
                    <div className="flex h-24 items-center justify-center text-center text-muted-foreground">
                        <p>No announcements at this time.</p>
                    </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
