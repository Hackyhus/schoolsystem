'use client';
import {
  Activity,
  ArrowUpRight,
  BookCheck,
  Users,
  MessageSquare,
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
import { announcements, lessonNotes, users } from '@/lib/mock-data';
import Link from 'next/link';

export function AdminDashboard() {
  const stats = [
    { title: 'Parent Engagement', value: '82%', icon: Activity, change: '+2.5% from last month' },
    { title: 'Lesson Notes Submitted', value: '125', icon: BookCheck, change: '+15 this week' },
    { title: 'Active Users', value: '350', icon: Users, change: '+5 new accounts' },
    { title: 'Messages Sent', value: '542', icon: MessageSquare, change: '24 new today' },
  ];

  const statusVariant = (status: string) => {
    if (status === 'Approved') return 'default';
    if (status === 'Pending HOD Approval' || status.includes('Pending')) return 'secondary';
    if (status === 'Rejected by HOD') return 'destructive';
    return 'outline';
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, Admin. Here's your school overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Lesson Notes</CardTitle>
            <CardDescription>
              Review and approve recently submitted lesson notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessonNotes.slice(0, 4).map((note) => (
                  <TableRow key={note.id}>
                    <TableCell>
                      <div className="font-medium">{note.teacherName}</div>
                      <div className="text-sm text-muted-foreground">{note.title}</div>
                    </TableCell>
                    <TableCell>{note.subject}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(note.status)}>{note.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                         <Link href={`/dashboard/lesson-notes/${note.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>
              Manage and broadcast school-wide announcements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {announcements.slice(0, 2).map((ann) => (
              <div key={ann.id} className="rounded-md border p-4">
                <h3 className="font-semibold">{ann.title}</h3>
                <p className="text-sm text-muted-foreground">{ann.content}</p>
                <p className="pt-2 text-xs text-muted-foreground">{ann.date}</p>
              </div>
            ))}
            <Button className="w-full">Create New Announcement</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
