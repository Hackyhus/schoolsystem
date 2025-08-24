'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';

export type ClassData = {
    id: string;
    name: string;
};

export type SubjectData = {
    id: string;
    name: string;
};

export type DepartmentData = {
    id: string;
    name: string;
};

export function useAcademicData() {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [subjects, setSubjects] = useState<SubjectData[]>([]);
    const [departments, setDepartments] = useState<DepartmentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const classesQuery = query(collection(db, 'classes'), orderBy('name'));
            const subjectsQuery = query(collection(db, 'subjects'), orderBy('name'));
            const departmentsQuery = query(collection(db, 'departments'), orderBy('name'));

            const [classesSnapshot, subjectsSnapshot, departmentsSnapshot] = await Promise.all([
                getDocs(classesQuery),
                getDocs(subjectsQuery),
                getDocs(departmentsQuery),
            ]);

            const classesList = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassData));
            const subjectsList = subjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubjectData));
            const departmentsList = departmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DepartmentData));

            setClasses(classesList);
            setSubjects(subjectsList);
            setDepartments(departmentsList);

        } catch (error) {
            console.error("Error fetching academic data:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load class, subject, or department data.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { classes, subjects, departments, isLoading, refetch: fetchData };
}
