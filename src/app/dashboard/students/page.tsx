
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
import { PlusCircle, Trash2, Eye, Upload } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import Link from 'next/link';
import { BulkStudentUploadDialog } from '@/components/dashboard/students/bulk-student-upload-dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { bulkDeleteStudents } from '@/actions/student-actions';


export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const { toast } = useToast();
  const { role } = useRole();

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, orderBy('studentId', 'asc'));
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentsList);
      
      // Restore and apply search term from localStorage
      const savedSearchTerm = localStorage.getItem('students-searchTerm') || '';
      setSearchTerm(savedSearchTerm);
      
      const lowercasedFilter = savedSearchTerm.toLowerCase();
      const filteredData = studentsList.filter(item => {
        return Object.values(item).some(val =>
          String(val).toLowerCase().includes(lowercasedFilter)
        ) || (item.guardians && item.guardians.some(g => String(g.fullName).toLowerCase().includes(lowercasedFilter)));
      });
      setFilteredStudents(filteredData);
      
      setSelectedStudents([]); // Reset selection on fetch
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch students. You may need to create a Firestore index.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    // Apply filter and save search term to localStorage
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = students.filter(item => {
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(lowercasedFilter)
      ) || (item.guardians && item.guardians.some(g => String(g.fullName).toLowerCase().includes(lowercasedFilter)));
    });
    setFilteredStudents(filteredData);
    localStorage.setItem('students-searchTerm', searchTerm);
  }, [searchTerm, students]);
  
  const handleSelectStudent = (studentId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };
  
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    try {
        await bulkDeleteStudents(selectedStudents);
        toast({
            title: 'Success',
            description: `${selectedStudents.length} student(s) have been deleted.`,
        });
        fetchStudents(); // This will also clear selection
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not delete the selected students.',
        });
    }
  };


  const removeStudent = async (student: Student) => {
    if (
      !confirm(
        `Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`
      )
    )
      return;
    try {
      await deleteDoc(doc(db, 'students', student.id));
      toast({
        title: 'Student Removed',
        description: 'The student has been successfully deleted.',
      });
      fetchStudents(); 
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
    setIsAddModalOpen(false);
    setIsBulkModalOpen(false);
  };
  
  const isAllSelected = useMemo(() => {
    return filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
  }, [selectedStudents, filteredStudents]);


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
            <CardTitle>All Students ({filteredStudents.length})</CardTitle>
            <CardDescription>
              A list of all students in the system.
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full flex-wrap sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search students..."
                    className="pl-8 sm:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {role === 'Admin' && (
              <div className="flex gap-2">
                {selectedStudents.length > 0 && (
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive">
                           <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedStudents.length})
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected {selectedStudents.length} student(s) and all their associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleBulkDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                   </AlertDialog>
                )}
                <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" /> Bulk Upload
                    </Button>
                  </DialogTrigger>
                  <BulkStudentUploadDialog onUploadComplete={handleStudentAdded} />
                </Dialog>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Student
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
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                 {role === 'Admin' && <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                    aria-label="Select all"
                  />
                </TableHead>}
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Primary Guardian</TableHead>
                <TableHead>Class</TableHead>
                 <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {role === 'Admin' && <TableCell><Skeleton className="h-5 w-5" /></TableCell>}
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-36" /></TableCell>
                     <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                     <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} data-state={selectedStudents.includes(student.id) && "selected"}>
                    {role === 'Admin' && <TableCell>
                       <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => handleSelectStudent(student.id, Boolean(checked))}
                        aria-label="Select student"
                      />
                    </TableCell>}
                    <TableCell className="font-mono text-xs">{student.studentId || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{`${student.firstName} ${student.lastName}`}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.guardians[0]?.fullName || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.classLevel}</Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant={student.status === 'Active' ? 'secondary' : 'destructive'}>{student.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button asChild variant="outline" size="icon" className="mr-2">
                         <Link href={`/dashboard/students/${encodeURIComponent(student.studentId)}`}>
                           <Eye className="h-4 w-4" />
                         </Link>
                       </Button>
                      {role === 'Admin' && <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStudent(student)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No students found. {searchTerm && "Try adjusting your search."}
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

