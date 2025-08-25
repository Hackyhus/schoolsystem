
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
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/schema';
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
import { useRole } from '@/context/role-context';


export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { role } = useRole();

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Student));
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
      // This only deletes from the 'students' collection.
      // A more robust solution would use a Cloud Function to also handle associated parent users and documents.
      await deleteDoc(doc(db, 'students', studentId));
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
          {role === 'Admin' ? 'Add, view, and manage student accounts and records.' : 'View student records.'}
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All Students</CardTitle>
            <CardDescription>
              A list of all students in the system.
            </CardDescription>
          </div>
          {role === 'Admin' && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Enroll New Student</DialogTitle>
                  <DialogDescription>
                    Fill in the form below to add a new student to the school database.
                  </DialogDescription>
                </DialogHeader>
                <AddStudentForm onStudentAdded={handleStudentAdded} />
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Primary Guardian</TableHead>
                <TableHead>Class</TableHead>
                 <TableHead>Status</TableHead>
                {role === 'Admin' && <TableHead className="text-right">Action</TableHead>}
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
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-36" />
                    </TableCell>
                     <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                     <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    {role === 'Admin' && <TableCell className="text-right">
                      <Skeleton className="ml-auto h-8 w-8" />
                    </TableCell>}
                  </TableRow>
                ))
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-xs">{student.studentId || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{`${student.firstName} ${student.lastName}`}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.guardians[0]?.fullName || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.classLevel}</Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant={student.status === 'Active' ? 'secondary' : 'destructive'}>{student.status}</Badge>
                    </TableCell>
                    {role === 'Admin' && <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStudent(student.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>}
                  </TableRow>
                ))
              )}
              {!isLoading && students.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={role === 'Admin' ? 6 : 5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No students found.
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
