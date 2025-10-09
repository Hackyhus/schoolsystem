
'use server';

import { z } from 'zod';
import { dbService } from '@/lib/firebase';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import type { FeeStructure, Student, Invoice, InvoiceItem } from '@/lib/schema';
import { revalidatePath } from 'next/cache';

const invoiceSchema = z.object({
  className: z.string().min(1, 'Class is required.'),
  session: z.string().min(1, 'Session is required.'),
  term: z.string().min(1, 'Term is required.'),
});

async function generateInvoiceId(): Promise<string> {
    const year = new Date().getFullYear();
    const invoiceCount = await dbService.getCountFromServer('invoices');
    const nextId = (invoiceCount + 1).toString().padStart(5, '0');
    return `INV-${year}-${nextId}`;
}

export async function generateInvoicesForClass(className: string, session: string, term: string) {
    try {
        const parsed = invoiceSchema.safeParse({ className, session, term });
        if (!parsed.success) {
            return { error: 'Invalid input provided.' };
        }

        // 1. Find the Fee Structure for the class, session, and term
        const feeStructures = await dbService.getDocs<FeeStructure>('feeStructures', [
            { type: 'where', fieldPath: 'className', opStr: '==', value: className },
            { type: 'where', fieldPath: 'session', opStr: '==', value: session },
            { type: 'where', fieldPath: 'term', opStr: '==', value: term },
            { type: 'limit', limitCount: 1 }
        ]);
        
        const feeStructure = feeStructures[0];
        if (!feeStructure) {
            return { error: `No fee structure found for ${className} for the ${term}, ${session} session. Please create one first.` };
        }

        // 2. Get all students in that class
        const students = await dbService.getDocs<Student>('students', [
            { type: 'where', fieldPath: 'classLevel', opStr: '==', value: className },
            { type: 'where', fieldPath: 'status', opStr: '==', value: 'Active' },
        ]);
        if (students.length === 0) {
            return { error: `No active students found in ${className}.` };
        }
        
        // 3. Check for existing invoices for these students for this term/session to prevent duplicates
        const studentIds = students.map(s => s.studentId);
        const existingInvoices = await dbService.getDocs<Invoice>('invoices', [
            { type: 'where', fieldPath: 'studentId', opStr: 'in', value: studentIds },
            { type: 'where', fieldPath: 'session', opStr: '==', value: session },
            { type: 'where', fieldPath: 'term', opStr: '==', value: term },
        ]);
        const existingInvoiceStudentIds = new Set(existingInvoices.map(inv => inv.studentId));

        // 4. Generate invoices only for students who don't have one yet
        const batch = dbService.createBatch();
        let generatedCount = 0;

        for (const student of students) {
            if (existingInvoiceStudentIds.has(student.studentId)) {
                continue; // Skip this student
            }

            const invoiceId = await generateInvoiceId();
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
