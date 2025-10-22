
'use server';

import { z } from 'zod';
import { dbService } from '@/lib/dbService';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import type { FeeStructure, Student, Invoice, InvoiceItem } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { CLASS_GROUPS } from '@/components/dashboard/fees/fee-structure-form';


const invoiceSchema = z.object({
  classGroup: z.string().min(1, 'Class group is required.'),
  session: z.string().min(1, 'Session is required.'),
  term: z.string().min(1, 'Term is required.'),
});

async function getNextInvoiceId(offset: number = 0): Promise<string> {
    const year = new Date().getFullYear();
    const invoiceCount = await dbService.getCountFromServer('invoices');
    const nextId = (invoiceCount + offset + 1).toString().padStart(5, '0');
    return `INV-${year}-${nextId}`;
}

const getClassesInGroup = async (classGroup: string): Promise<string[]> => {
    const all_classes = await dbService.getDocs<{name: string}>('classes');
    if (classGroup === 'Pre-Nursery & Nursery') {
        return all_classes.filter(c => c.name.includes('Nursery')).map(c => c.name);
    }
     if (classGroup === 'Primary') {
        return all_classes.filter(c => c.name.includes('Primary')).map(c => c.name);
    }
    if (classGroup === 'JSS') {
        return all_classes.filter(c => c.name.includes('JSS')).map(c => c.name);
    }
    if (classGroup === 'SSS') {
        return all_classes.filter(c => c.name.includes('SSS')).map(c => c.name);
    }
    return [];
}


export async function generateInvoicesForClassGroup(classGroup: string, session: string, term: string) {
    try {
        const parsed = invoiceSchema.safeParse({ classGroup, session, term });
        if (!parsed.success) {
            return { error: 'Invalid input provided.' };
        }

        // 1. Find the Fee Structure for the selected group
        const feeStructures = await dbService.getDocs<FeeStructure>('feeStructures', [
            { type: 'where', fieldPath: 'className', opStr: '==', value: classGroup },
            { type: 'where', fieldPath: 'session', opStr: '==', value: session },
            { type: 'where', fieldPath: 'term', opStr: '==', value: term },
            { type: 'limit', limitCount: 1 }
        ]);
        
        const feeStructure = feeStructures[0];
        if (!feeStructure) {
            return { error: `No fee structure found for the ${classGroup} group for the ${term}, ${session} session. Please create one first.` };
        }

        // 2. Get all classes within that group
        const classesInGroup = await getClassesInGroup(classGroup);
        if (classesInGroup.length === 0) {
            return { error: `No classes found for the ${classGroup} group.` };
        }

        // 3. Get all students in those classes
        const students = await dbService.getDocs<Student>('students', [
            { type: 'where', fieldPath: 'classLevel', opStr: 'in', value: classesInGroup },
            { type: 'where', fieldPath: 'status', opStr: '==', value: 'Active' },
        ]);
        if (students.length === 0) {
            return { error: `No active students found in the ${classGroup} group.` };
        }
        
        // 4. Check for existing invoices for these students for this term/session to prevent duplicates
        const studentIds = students.map(s => s.studentId);
        const existingInvoices = await dbService.getDocs<Invoice>('invoices', [
            { type: 'where', fieldPath: 'studentId', opStr: 'in', value: studentIds },
            { type: 'where', fieldPath: 'session', opStr: '==', value: session },
            { type: 'where', fieldPath: 'term', opStr: '==', value: term },
        ]);
        const existingInvoiceStudentIds = new Set(existingInvoices.map(inv => inv.studentId));

        // 5. Generate invoices only for students who don't have one yet
        const batch = dbService.createBatch();
        let generatedCount = 0;
        
        const initialInvoiceCount = await dbService.getCountFromServer('invoices');
        const year = new Date().getFullYear();


        for (const student of students) {
            if (existingInvoiceStudentIds.has(student.studentId)) {
                continue; // Skip this student
            }
            
            const nextId = (initialInvoiceCount + generatedCount + 1).toString().padStart(5, '0');
            const invoiceId = `INV-${year}-${nextId}`;

            const dueDate = Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() + 30))); // Due in 30 days

            const newInvoice: Omit<Invoice, 'id'> = {
                invoiceId,
                studentId: student.studentId,
                studentName: `${student.firstName} ${student.lastName}`,
                class: student.classLevel,
                session,
                term,
                items: feeStructure.items,
                totalAmount: feeStructure.totalAmount,
                amountPaid: 0,
                balance: feeStructure.totalAmount,
                status: 'Unpaid',
                createdAt: serverTimestamp(),
                dueDate,
            };
            
            batch.set('invoices', null, newInvoice);
            generatedCount++;
        }
        
        if (generatedCount > 0) {
            await batch.commit();
        }
        
        revalidatePath('/dashboard/accountant/invoices');
        return { 
            success: true, 
            generatedCount,
            skippedCount: students.length - generatedCount
        };

    } catch (error: any) {
        console.error('Error generating invoices:', error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}
