'use client';
import { Book, CheckCircle, Clock, FileQuestion, Upload, XCircle } from 'lucide-react';
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
import { useRole } from '@/context/role-context';
import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockLessonNote } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function TeacherDashboard() {
  const { user } = useRole();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    pendingPlans: 0,
    pendingExams: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch lesson notes
      const notesQuery = query(collection(db, 'lessonNotes'), where('teacherId', '==', user.uid), where('status', 'in', ['Pending HOD Approval', 'Pending Admin Approval']));
      const notesSnapshot = await getDocs(notesQuery);
      
      // Fetch exam questions - assuming a similar structure
      const examsQuery = query(collection(db, 'examQuestions'), where('teacherId', '==', user.uid), where('status', '==', 'Pending Review'));
      const examsSnapshot = await getDocs(examsQuery);

      setStats({
        pendingPlans: notesSnapshot.size,
        pendingExams: examsSnapshot.size,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch your dashboard data.",
      });
    } finally {
        setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {user?.displayName || 'Teacher'}. Manage your lesson notes and performance data.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Lesson Plans</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.pendingPlans}</div>
            <p className="text-xs text-muted-foreground">awaiting review by HOD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Exam Questions</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.pendingExams}</div>
            <p className="text-xs text-muted-foreground">awaiting review by Exam Officer</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
             Recent updates on your submissions.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-4 text-center text-muted-foreground">
            <p>No new notifications.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
