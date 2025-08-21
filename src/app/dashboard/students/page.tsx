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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MockUser } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddStudentForm } from '@/components/dashboard/students/add-student-form';


export default function StudentsPage() {
  const [students, setStudents] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // Query for users that have the role 'Student'.
      const q = query(usersRef, where('role', '==', 'Student'));
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as MockUser));
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch students.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);


  const removeStudent = async (studentId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this student? This action cannot be undone.'
      )
    )
      return;
    try {
      await deleteDoc(doc(db, 'users', studentId));
      toast({
        title: 'Student Removed',
        description: 'The student has been successfully deleted.',
      });
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error removing student:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not remove the student.',
      });
    }
  };

  const handleStudentAdded = () => {
    fetchStudents();
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Student Management</h1>
        <p className="text-muted-foreground">
          Add, view, and manage student accounts.
        </p>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>All Students</CardTitle>
            <CardDescription>
              A list of all students in the system.
            </CardDescription>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Create a new account for a student.
                </DialogDescription>
              </DialogHeader>
              <AddStudentForm onStudentAdded={handleStudentAdded} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-36" />
                    </TableCell>
                     <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 inline-block" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">{student.staffId || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      {/* This will be dynamic later */}
                      <Badge variant="outline">JSS 1</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStudent(student.id.toString())}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && students.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No students found. Add a student to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
