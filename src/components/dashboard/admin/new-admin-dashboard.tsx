'use client';
import {
  Users,
  CalendarDays,
  Utensils,
  BookUser,
  Clock,
  Heartbeat,
  UserGraduate,
  ChalkboardTeacher,
} from 'lucide-react';
import {
  Card,
  CardContent,
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
import { collection, getDocs, limit, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockUser } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import Image from 'next/image';

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--secondary))",
  },
} 

export function NewAdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    pending: 0,
  });
  const [teachers, setTeachers] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const studentsQuery = query(collection(db, "users"), where("role", "==", "Student"));
      const teachersQuery = query(collection(db, "users"), where("role", "==", "Teacher"));
      const lessonNotesQuery = query(collection(db, "lessonNotes"), where("status", "in", ["Pending HOD Approval", "Pending Admin Approval"]));
      
      const studentsSnapshot = await getDocs(studentsQuery);
      const teachersSnapshot = await getDocs(teachersQuery);
      const pendingSnapshot = await getDocs(lessonNotesQuery);
      
      setStats({
        students: studentsSnapshot.size,
        teachers: teachersSnapshot.size,
        pending: pendingSnapshot.size,
      });

      const teacherList = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockUser));
      setTeachers(teacherList);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch dashboard data.",
      });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  return (
    <div className="flex flex-col gap-8">
       <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, Admin</h1>
        <p className="text-gray-600">Here is what is happening at Great Insight International Academy today.</p>
      </div>
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
             <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <UserGraduate className=" text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Staff</CardTitle>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <ChalkboardTeacher className="text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.teachers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">System Health</CardTitle>
             <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Heartbeat className="text-white" />
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
                <CardTitle>School Performance</CardTitle>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                        <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
                        </linearGradient>
                        </defs>
                        <Area
                        dataKey="mobile"
                        type="natural"
                        fill="url(#fillMobile)"
                        fillOpacity={0.4}
                        stroke="var(--color-mobile)"
                        stackId="a"
                        />
                        <Area
                        dataKey="desktop"
                        type="natural"
                        fill="url(#fillDesktop)"
                        fillOpacity={0.4}
                        stroke="var(--color-desktop)"
                        stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
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
                            {teachers.slice(0, 5).map(teacher => (
                                <TableRow key={teacher.id}>
                                    <TableCell>{teacher.name}</TableCell>
                                    <TableCell>{teacher.department}</TableCell>
                                    <TableCell>{teacher.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={teacher.status === 'Active' ? 'default' : 'destructive'}>
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
            <Card>
                <CardHeader>
                    <CardTitle>Unpaid Student Intuition</CardTitle>
                </CardHeader>
                 <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Fees</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             <TableRow>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Image src="https://placehold.co/40x40.png" alt="Jordan Nico" data-ai-hint="person portrait" width={32} height={32} className="w-8 h-8 rounded-full" />
                                        <span>Jordan Nico</span>
                                    </div>
                                </TableCell>
                                <TableCell>VII B</TableCell>
                                <TableCell>$ 52,036</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Image src="https://placehold.co/40x40.png" alt="Karen Hope" data-ai-hint="person portrait" width={32} height={32} className="w-8 h-8 rounded-full" />
                                        <span>Karen Hope</span>
                                    </div>
                                </TableCell>
                                <TableCell>VII A</TableCell>
                                <TableCell>$ 53,036</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Image src="https://placehold.co/40x40.png" alt="Nadila Adja" data-ai-hint="person portrait" width={32} height={32} className="w-8 h-8 rounded-full" />
                                        <span>Nadila Adja</span>
                                    </div>
                                </TableCell>
                                <TableCell>VII B</TableCell>
                                <TableCell>$ 54,036</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
