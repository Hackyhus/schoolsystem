
'use client';

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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';
import type { MockUser } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRole } from '@/context/role-context';
import { Badge } from '@/components/ui/badge';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useAcademicData } from '@/hooks/use-academic-data';

type Score = {
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  status: 'Pending' | 'Approved' | 'Rejected';
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
        initialScores[student.id] = { ca1: 0, ca2: 0, exam: 0, total: 0, status: 'Pending' };
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

  const handleSaveScores = () => {
      // Logic to save scores to the database will be implemented here.
      // This will involve creating or updating a 'scores' collection.
      console.log('Saving scores:', scores);
       toast({
        title: 'Scores Submitted!',
        description: 'The scores have been submitted to the Exam Officer for review.',
      });
  }

  const handleReview = async (studentId: string, newStatus: 'Approved' | 'Rejected') => {
    setScores(prev => ({...prev, [studentId]: {...prev[studentId], status: newStatus}}));
    // In a real app, this would also update the database
    toast({ title: `Score ${newStatus}` });
  }

  const handleApproveAll = async () => {
    // This is a placeholder for a batch update
    const updatedScores = { ...scores };
    Object.keys(updatedScores).forEach(studentId => {
        if(updatedScores[studentId].status === 'Pending') {
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

  const renderRoleSpecificContent = () => {
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
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-12" /></TableCell>
                        </TableRow>
                    ))
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            max={20}
                            onChange={(e) => handleScoreChange(student.id, 'ca1', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            max={20}
                            onChange={(e) => handleScoreChange(student.id, 'ca2', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            max={60}
                            onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                            {scores[student.id]?.total || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Select a class and subject to load students.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
            </Table>
        )
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
                   {isLoading ? (
                     Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-40" /></TableCell>
                        </TableRow>
                    ))
                  ) : students.length > 0 ? (
                    students.map((student) => (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Select a class and subject to load scores.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
            </Table>
        )
    }
    return null;
  }

  const renderFooter = () => {
    if (students.length === 0) return null;
    if (role === 'Teacher') {
        return (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveScores}>Submit Scores to Exam Officer</Button>
            </div>
        )
    }
    if (role === 'ExamOfficer') {
         return (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleApproveAll}>Approve All Pending</Button>
            </div>
        )
    }
    return null;
  }


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
          <CardTitle>Select Class & Subject</CardTitle>
          <div className="mt-4 flex flex-wrap gap-4">
            <Select onValueChange={setSelectedClass} value={selectedClass} disabled={isAcademicDataLoading}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={isAcademicDataLoading ? "Loading..." : "Select Class"} />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={isAcademicDataLoading}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={isAcademicDataLoading ? "Loading..." : "Select Subject"} />
              </SelectTrigger>
              <SelectContent>
                 {subjects.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleLoadStudents} disabled={isLoading || isAcademicDataLoading}>
              {isLoading ? 'Loading...' : 'Load Data'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderRoleSpecificContent()}
          {renderFooter()}
        </CardContent>
      </Card>
    </div>
  );
}
