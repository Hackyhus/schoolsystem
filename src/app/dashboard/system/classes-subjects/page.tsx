
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAcademicData, ClassData, SubjectData } from '@/hooks/use-academic-data';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClassesSubjectsPage() {
    const { classes, subjects, isLoading, refetch } = useAcademicData();
    const [newItemName, setNewItemName] = useState('');
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const { toast } = useToast();

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
            refetch(); // Refetch data
            if (type === 'class') setIsClassModalOpen(false);
            else setIsSubjectModalOpen(false);
        } catch (error) {
            console.error(`Error adding ${type}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: `Could not add ${type}.` });
        }
    };

    const handleRemoveItem = async (type: 'class' | 'subject', item: ClassData | SubjectData) => {
         if (!confirm(`Are you sure you want to remove "${item.name}"? This could affect existing records.`)) {
            return;
        }
        const collectionName = type === 'class' ? 'classes' : 'subjects';
        try {
            await deleteDoc(doc(db, collectionName, item.id));
            toast({ title: 'Success', description: `${type.charAt(0).toUpperCase() + type.slice(1)} "${item.name}" has been removed.` });
            refetch(); // Refetch data
        } catch (error) {
            console.error(`Error removing ${type}:`, error);
            toast({ variant: 'destructive', title: 'Error', description: `Could not remove ${type}.` });
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Classes & Subjects</h1>
                <p className="text-muted-foreground">
                    Manage all classes and subjects offered in the school.
                </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Manage Classes</CardTitle>
                            <CardDescription>Add or remove school classes.</CardDescription>
                        </div>
                        <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Class</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Class</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Input 
                                        placeholder="e.g., SS 3" 
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                    />
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
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : classes.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('class', c)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Manage Subjects</CardTitle>
                            <CardDescription>Add or remove school subjects.</CardDescription>
                        </div>
                          <Dialog open={isSubjectModalOpen} onOpenChange={setIsSubjectModalOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Subject</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Subject</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Input 
                                        placeholder="e.g., Further Mathematics" 
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                    />
                                    <Button onClick={() => handleAddItem('subject')} className="w-full">Add Subject</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject Name</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : subjects.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem('subject', s)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
