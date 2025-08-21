
'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
import { studentPerformance } from '@/lib/mock-data';
import { TrendingUp, UserCheck } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export default function PerformancePage() {
  const { studentName, attendance, grades, recentReport } = studentPerformance;
  const overallAttendance =
    attendance.reduce((acc, month) => acc + month.percentage, 0) /
    attendance.length;

  const gradeColor = (grade: string) => {
    if (grade === 'A') return 'bg-green-500';
    if (grade === 'B') return 'bg-blue-500';
    if (grade === 'C') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const chartConfig = {
    score: {
      label: 'Score',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Student Performance
        </h1>
        <p className="text-muted-foreground">
          Viewing attendance and grades for{' '}
          <span className="font-semibold text-primary">{studentName}</span>.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Attendance
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallAttendance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2% from last term
            </p>
            <Progress value={overallAttendance} className="mt-4 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Grade
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                grades.reduce((acc, g) => acc + g.score, 0) / grades.length
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Overall average score
            </p>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Teacher's Comment
            </CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground italic">
              "{recentReport}"
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grades by Subject</CardTitle>
            <CardDescription>
              A bar chart showing performance in each subject.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={grades} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="subject"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis />
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar
                    dataKey="score"
                    fill="var(--color-score)"
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Grade Report</CardTitle>
            <CardDescription>
              A complete list of subjects and corresponding grades.
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
                {grades.map((g) => (
                  <TableRow key={g.subject}>
                    <TableCell className="font-medium">{g.subject}</TableCell>
                    <TableCell>{g.score}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={`w-10 justify-center text-white ${gradeColor(
                          g.grade
                        )}`}
                      >
                        {g.grade}
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
  );
}
