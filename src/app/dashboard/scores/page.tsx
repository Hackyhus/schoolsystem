'use client';

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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import type { MockUser } from '@/lib/schema';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Score = {
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
};

export default function ScoresPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState<MockUser[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
        initialScores[student.id] = { ca1: 0, ca2: 0, exam: 0, total: 0 };
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

  const handleScoreChange = (studentId: string, field: keyof Omit<Score, 'total'>, value: string) => {
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


  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Enter Student Scores
        </h1>
        <p className="text-muted-foreground">
          Input Continuous Assessment (CA) and exam scores for your students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Class & Subject</CardTitle>
          <div className="mt-4 flex flex-wrap gap-4">
            <Select onValueChange={setSelectedClass} value={selectedClass}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {/* Populate with teacher's classes */}
                <SelectItem value="jss1">JSS 1</SelectItem>
                <SelectItem value="jss2">JSS 2</SelectItem>
                <SelectItem value="ss1">SS 1</SelectItem>
                <SelectItem value="ss2">SS 2</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedSubject} value={selectedSubject}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {/* Populate with teacher's subjects */}
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="english">English Language</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleLoadStudents} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load Students'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
          {students.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveScores}>Submit Scores to Exam Officer</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
