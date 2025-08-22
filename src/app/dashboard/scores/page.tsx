
'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAcademicData } from '@/hooks/use-academic-data';
import { useRole } from '@/context/role-context';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockUser } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ThumbsDown, ThumbsUp, Save } from 'lucide-react';

type Score = {
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Draft';
};

export default function ScoresPage() {
  const { role } = useRole();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState<MockUser[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { classes, subjects, isLoading: isAcademicDataLoading } = useAcademicData();

  const handleLoadStudents = async () => {
    if (!selectedClass || !selectedSubject) {
      toast({
        variant: 'destructive',
        title: 'Selection Required',
        description: 'Please select both a class and a subject.',
      });
      return;
    }
    setIsLoading(true);
    try {
      // In a real app, you'd fetch students based on the selected class.
      // For now, we'll fetch all students as a placeholder.
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'Student'));
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MockUser)
      );
      setStudents(studentsList);

      // Initialize scores for the loaded students
      const initialScores: Record<string, Score> = {};
      studentsList.forEach((student) => {
        initialScores[student.id] = { ca1: 0, ca2: 0, exam: 0, total: 0, status: 'Draft' };
      });
      setScores(initialScores);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load students.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (studentId: string, field: keyof Omit<Score, 'total' | 'status'>, value: string) => {
    const numericValue = Number(value) || 0;
    setScores(prevScores => {
      const newScores = { ...prevScores };
      const studentScore = { ...newScores[studentId], [field]: numericValue };
      studentScore.total = studentScore.ca1 + studentScore.ca2 + studentScore.exam;
      newScores[studentId] = studentScore;
      return newScores;
    });
  };

  const handleSaveScores = (asDraft: boolean) => {
    // Logic to save scores to the database will be implemented here.
    // This will involve creating or updating a 'scores' collection.
    console.log('Saving scores:', scores);
    toast({
      title: asDraft ? 'Scores Saved as Draft!' : 'Scores Submitted!',
      description: asDraft ? 'Your progress has been saved.' : 'The scores have been submitted to the Exam Officer for review.',
    });
    // In a real app, you'd likely update the status of each score here
  }

  const handleReview = async (studentId: string, newStatus: 'Approved' | 'Rejected') => {
    setScores(prev => ({ ...prev, [studentId]: { ...prev[studentId], status: newStatus } }));
    // In a real app, this would also update the database
    toast({ title: `Score ${newStatus}` });
  }

  const handleApproveAll = async () => {
    // This is a placeholder for a batch update
    const updatedScores = { ...scores };
    Object.keys(updatedScores).forEach(studentId => {
      if (updatedScores[studentId].status === 'Pending') {
        updatedScores[studentId].status = 'Approved';
      }
    });
    setScores(updatedScores);
    toast({ title: 'All Pending Scores Approved' });
  };

  const statusVariant = (status: string) => {
    if (status.includes('Approved')) return 'default';
    if (status.includes('Pending')) return 'secondary';
    if (status.includes('Rejected')) return 'destructive';
    return 'outline';
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-16" />
            </div>
          ))}
        </div>
      );
    }

    if (students.length === 0) {
      return (
        <div className="flex h-48 flex-col items-center justify-center rounded-md border border-dashed text-center">
          <h3 className="text-lg font-medium">No Students Loaded</h3>
          <p className="text-sm text-muted-foreground">Please select a class and subject, then click "Load Data".</p>
        </div>
      );
    }
    
    if (role === 'Teacher') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead className="w-[120px]">CA 1 (20%)</TableHead>
              <TableHead className="w-[120px]">CA 2 (20%)</TableHead>
              <TableHead className="w-[120px]">Exam (60%)</TableHead>
              <TableHead className="w-[100px] text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>
                  <Input type="number" max={20} onChange={(e) => handleScoreChange(student.id, 'ca1', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input type="number" max={20} onChange={(e) => handleScoreChange(student.id, 'ca2', e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input type="number" max={60} onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {scores[student.id]?.total || 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (role === 'ExamOfficer') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{scores[student.id]?.total || 0}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(scores[student.id]?.status)}>{scores[student.id]?.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleReview(student.id, 'Approved')} disabled={scores[student.id]?.status === 'Approved'}>
                    <ThumbsUp className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReview(student.id, 'Rejected')} disabled={scores[student.id]?.status === 'Rejected'}>
                    <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          {role === 'Teacher' ? 'Enter Student Scores' : 'Validate Student Scores'}
        </h1>
        <p className="text-muted-foreground">
          {role === 'Teacher' ? 'Input Continuous Assessment (CA) and exam scores for your students.' : 'Validate scores submitted by teachers before result generation.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gradebook</CardTitle>
          <CardDescription>Select a class and subject to begin entering or reviewing scores.</CardDescription>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
              <Select onValueChange={setSelectedClass} value={selectedClass} disabled={isAcademicDataLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isAcademicDataLoading ? "Loading..." : "Select Class"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={isAcademicDataLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isAcademicDataLoading ? "Loading..." : "Select Subject"} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLoadStudents} disabled={isLoading || isAcademicDataLoading}>
              {isLoading ? 'Loading...' : 'Load Students'}
            </Button>
            <div className="ml-auto flex gap-2">
              {role === 'Teacher' && students.length > 0 && (
                <>
                  <Button variant="outline" onClick={() => handleSaveScores(true)}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={() => handleSaveScores(false)}>
                    Submit to Exam Officer
                  </Button>
                </>
              )}
              {role === 'ExamOfficer' && students.length > 0 && (
                <Button onClick={handleApproveAll}>Approve All Pending</Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
