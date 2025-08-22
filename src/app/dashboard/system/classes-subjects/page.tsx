'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with database calls
const initialClasses = [
    { id: 1, name: 'JSS 1' },
    { id: 2, name: 'JSS 2' },
    { id: 3, name: 'SS 1' },
];

const initialSubjects = [
    { id: 1, name: 'Mathematics' },
    { id: 2, name: 'English Language' },
    { id: 3, name: 'Physics' },
];

export default function ClassesSubjectsPage() {
    const [classes, setClasses] = useState(initialClasses);
    const [subjects, setSubjects] = useState(initialSubjects);
    const [newClassName, setNewClassName] = useState('');
    const [newSubjectName, setNewSubjectName] = useState('');
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const { toast } = useToast();

    const handleAddClass = () => {
        if (newClassName.trim() === '') {
            toast({ variant: 'destructive', title: 'Error', description: 'Class name cannot be empty.' });
            return;
        }
        setClasses([...classes, { id: Date.now(), name: newClassName }]);
        toast({ title: 'Success', description: `Class "${newClassName}" has been added.` });
        setNewClassName('');
        setIsClassModalOpen(false);
    };

    const handleRemoveClass = (id: number) => {
        const className = classes.find(c => c.id === id)?.name;
        setClasses(classes.filter(c => c.id !== id));
        toast({ title: 'Success', description: `Class "${className}" has been removed.` });
    };
    
    const handleAddSubject = () => {
        if (newSubjectName.trim() === '') {
            toast({ variant: 'destructive', title: 'Error', description: 'Subject name cannot be empty.' });
            return;
        }
        setSubjects([...subjects, { id: Date.now(), name: newSubjectName }]);
        toast({ title: 'Success', description: `Subject "${newSubjectName}" has been added.` });
        setNewSubjectName('');
        setIsSubjectModalOpen(false);
    };

    const handleRemoveSubject = (id: number) => {
        const subjectName = subjects.find(s => s.id === id)?.name;
        setSubjects(subjects.filter(s => s.id !== id));
        toast({ title: 'Success', description: `Subject "${subjectName}" has been removed.` });
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
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                    />
                                    <Button onClick={handleAddClass} className="w-full">Add Class</Button>
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
                                {classes.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveClass(c.id)}>
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
                                        value={newSubjectName}
                                        onChange={(e) => setNewSubjectName(e.target.value)}
                                    />
                                    <Button onClick={handleAddSubject} className="w-full">Add Subject</Button>
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
                                {subjects.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveSubject(s.id)}>
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
