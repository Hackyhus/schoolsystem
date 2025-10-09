'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Edit, X, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAcademicData, ClassData, SubjectData } from '@/hooks/use-academic-data';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MockUser } from '@/lib/schema';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

type ClassDetail = ClassData & {
    teacherName?: string;
    subjects?: { id: string; name: string; teacherId?: string; teacherName?: string }[];
};

export default function ClassesSubjectsPage() {
    const { classes, subjects, refetch: refetchAcademicData } = useAcademicData();
    const [newItemName, setNewItemName] = useState('');
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [teachers, setTeachers] = useState<MockUser[]>([]);
    const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
    const [editingClass, setEditingClass] = useState<ClassDetail | null>(null);

    const { toast } = useToast();

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all teachers
            const teachersQuery = query(collection(db, 'users'), where('role', 'in', ['Teacher', 'HeadOfDepartment']));
            const teachersSnapshot = await getDocs(teachersQuery);
            const teacherList = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MockUser));
            setTeachers(teacherList);

            // Fetch all classes
            const classesSnapshot = await getDocs(collection(db, 'classes'));
            const classList = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassData));
            
            // Fetch all subjects
            const subjectsSnapshot = await getDocs(collection(db, 'subjects'));
            const subjectList = subjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectData));

            // Populate class details
            const details: ClassDetail[] = classList.map(cls => {
                const classTeacher = teacherList.find(t => t.id === cls.teacherId);
                const classSubjects = (cls.subjectIds || []).map((subId: string) => {
                    const subjectDoc = subjectList.find(s => s.id === subId);
                    const subjectTeacher = teacherList.find(t => t.id === (cls.subjectTeachers?.[subId] || ''));
                    return {
                        id: subId,
                        name: subjectDoc?.name || 'Unknown Subject',
                        teacherId: subjectTeacher?.id,
                        teacherName: subjectTeacher?.name || 'Not Assigned',
                    };
                });
                return {
                    ...cls,
                    teacherName: classTeacher?.name || 'Not Assigned',
                    subjects: classSubjects,
                };
            });
            setClassDetails(details);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load required data.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleAddItem = async (type: 'class' | 'subject') => {
        if (newItemName.trim() === '') {
            toast({ variant: 'destructive', title: 'Error', description: 'Name cannot be empty.' });
            return;
        }
        const collectionName = type === 'class' ? 'classes' : 'subjects';
        try {
            await addDoc(collection(db, collectionName), { name: newItemName });
            toast({ title: 'Success', description: `${type.charAt(0).toUpperCase() + type.slice(1)} "${newItemName}" has been added.` });
            setNewItemName('');
            refetchAcademicData();
            fetchAllData();
            if (type === 'class') setIsClassModalOpen(false);
            else setIsSubjectModalOpen(false);
        } catch (error) {
            console.error(`Error adding ${type}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: `Could not add ${type}.` });
        }
    };

    const handleRemoveItem = async (type: 'class' | 'subject', item: {id: string, name: string}) => {
        if (!confirm(`Are you sure you want to remove "${item.name}"? This could affect existing records.`)) {
            return;
        }
        const collectionName = type === 'class' ? 'classes' : 'subjects';
        try {
            await deleteDoc(doc(db, collectionName, item.id));
            toast({ title: 'Success', description: `${type.charAt(0).toUpperCase() + type.slice(1)} "${item.name}" has been removed.` });
            refetchAcademicData();
            fetchAllData();
        } catch (error) {
            console.error(`Error removing ${type}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: `Could not remove ${type}.` });
        }
    };

    const handleSaveChanges = async () => {
        if (!editingClass) return;
        
        try {
            const classRef = doc(db, 'classes', editingClass.id);
            const dataToUpdate = {
                teacherId: editingClass.teacherId || null,
                subjectIds: editingClass.subjects?.map(s => s.id) || [],
                subjectTeachers: editingClass.subjects?.reduce((acc, sub) => {
                    if (sub.teacherId) {
                        acc[sub.id] = sub.teacherId;
                    }
                    return acc;
                }, {} as Record<string, string>) || {},
            };

            await updateDoc(classRef, dataToUpdate);
            
            toast({ title: 'Success', description: `Configuration for ${editingClass.name} has been updated.` });
            setEditingClass(null);
            fetchAllData();
        } catch (error) {
            console.error("Error updating class config:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the configuration.' });
        }
    };
    
    const handleSubjectAssignmentChange = (subjectId: string, teacherId: string) => {
        if (!editingClass) return;
        
        const updatedSubjects = editingClass.subjects?.map(s => {
            if (s.id === subjectId) {
                const teacher = teachers.find(t => t.id === teacherId);
                return { ...s, teacherId, teacherName: teacher?.name || 'Not Assigned' };
            }
            return s;
        });

        setEditingClass({ ...editingClass, subjects: updatedSubjects });
    };

    const handleClassTeacherChange = (teacherId: string) => {
         if (!editingClass) return;
         const teacher = teachers.find(t => t.id === teacherId);
         setEditingClass({ ...editingClass, teacherId, teacherName: teacher?.name || 'Not Assigned' });
    }
    
    const handleAddSubjectToClass = (subjectId: string) => {
        if (!editingClass) return;
        
        const subjectToAdd = subjects.find(s => s.id === subjectId);
        if (!subjectToAdd || editingClass.subjects?.some(s => s.id === subjectId)) {
            return;
        }
        
        const newSubjects = [...(editingClass.subjects || []), { id: subjectToAdd.id, name: subjectToAdd.name, teacherName: 'Not Assigned' }];
        setEditingClass({ ...editingClass, subjects: newSubjects });
    };

    const handleRemoveSubjectFromClass = (subjectId: string) => {
         if (!editingClass) return;
         const newSubjects = editingClass.subjects?.filter(s => s.id !== subjectId);
         setEditingClass({ ...editingClass, subjects: newSubjects });
    }

    if (editingClass) {
        const availableSubjects = subjects.filter(sub => !editingClass.subjects?.some(s => s.id === sub.id));
        return (
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Configure: {editingClass.name}</CardTitle>
                            <CardDescription>Assign a class teacher, subjects, and subject teachers.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setEditingClass(null)}><X className="h-5 w-5" /></Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Class Teacher Assignment */}
                    <div className="space-y-2">
                        <Label className="font-semibold">Class Teacher</Label>
                        <Select value={editingClass.teacherId} onValueChange={handleClassTeacherChange}>
                            <SelectTrigger><SelectValue placeholder="Assign a class teacher" /></SelectTrigger>
                            <SelectContent>
                                {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Separator />

                    {/* Subject Assignment */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Subjects Offered in this Class</h3>
                        <div className="space-y-4">
                            {editingClass.subjects?.map(subject => (
                                <div key={subject.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-md">
                                    <div className="flex-1 font-medium">{subject.name}</div>
                                    <div className="flex-1 w-full sm:w-auto">
                                        <Select value={subject.teacherId} onValueChange={(teacherId) => handleSubjectAssignmentChange(subject.id, teacherId)}>
                                            <SelectTrigger><SelectValue placeholder="Assign Subject Teacher" /></SelectTrigger>
                                            <SelectContent>
                                                {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSubjectFromClass(subject.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                           <Select onValueChange={handleAddSubjectToClass} value="">
                               <SelectTrigger><SelectValue placeholder="Add a subject..." /></SelectTrigger>
                               <SelectContent>
                                   {availableSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                               </SelectContent>
                           </Select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4" /> Save Configuration</Button>
                    </div>
                </CardContent>
             </Card>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Academic Configuration</h1>
                <p className="text-muted-foreground">
                    Manage classes, subjects, and their assignments to teachers.
                </p>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Global Subjects</CardTitle>
                    <CardDescription>Add or remove subjects available to all classes.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {subjects.map(s => (
                        <Badge key={s.id} variant="secondary" className="flex gap-2 items-center">
                            <span>{s.name}</span>
                            <button onClick={() => handleRemoveItem('subject', s)}><X className="h-3 w-3" /></button>
                        </Badge>
                    ))}
                     <Dialog open={isSubjectModalOpen} onOpenChange={setIsSubjectModalOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Subject</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add New Global Subject</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <Input placeholder="e.g., Further Mathematics" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                                <Button onClick={() => handleAddItem('subject')} className="w-full">Add Subject</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Manage Classes &amp; Assignments</CardTitle>
                        <CardDescription>View all classes and configure their teachers and subjects.</CardDescription>
                    </div>
                     <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Class</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add New Class</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <Input placeholder="e.g., SS 3" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                                <Button onClick={() => handleAddItem('class')} className="w-full">Add Class</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class Name</TableHead>
                                <TableHead>Class Teacher</TableHead>
                                <TableHead>Subjects Offered</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                                    </TableRow>
                                ))
                            ) : classDetails.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell>{c.teacherName}</TableCell>
                                    <TableCell>{c.subjects?.length || 0}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditingClass(c)}><Edit className="mr-2 h-4 w-4" />Configure</Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('class', c)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
