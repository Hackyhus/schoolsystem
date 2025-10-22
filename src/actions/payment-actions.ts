
'use server';

import { z } from 'zod';
import { dbService } from '@/lib/dbService';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Invoice, Payment, MockUser, Student } from '@/lib/schema';
import { revalidatePath } from 'next/cache';

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amountPaid: z.coerce.number().positive('Payment amount must be positive'),
  paymentDate: z.date({ required_error: 'Payment date is required' }),
  paymentMethod: z.enum(['Bank Transfer', 'POS', 'Cash']),
  notes: z.string().optional(),
  userId: z.string(), // Added to pass the current user's ID
});

export async function recordPayment(values: z.infer<typeof paymentSchema>) {
    try {
        const parsed = paymentSchema.safeParse(values);
        if (!parsed.success) {
            return { error: 'Invalid data provided.' };
        }
        
        const { userId, invoiceId, amountPaid, paymentDate, paymentMethod, notes } = parsed.data;

        if (!userId) {
            return { error: 'Authentication required.' };
        }

        const invoices = await dbService.getDocs<Invoice>('invoices', [{ type: 'where', fieldPath: 'invoiceId', opStr: '==', value: invoiceId }]);
        if (invoices.length === 0) {
            return { error: 'Invoice not found.' };
        }
        const invoice = invoices[0];
        
        if (invoice.status === 'Paid') {
            return { error: 'This invoice has already been fully paid.' };
        }
        
        const batch = dbService.createBatch();
        const overpayment = amountPaid - invoice.balance;

        let newBalance: number;
        let newAmountPaid: number;
        let newStatus: Invoice['status'];

        if (overpayment > 0) {
            // Overpayment case
            newBalance = 0;
            newAmountPaid = invoice.totalAmount;
            newStatus = 'Paid';
        } else {
            // Normal or partial payment case
            newBalance = invoice.balance - amountPaid;
            newAmountPaid = invoice.amountPaid + amountPaid;
            newStatus = newBalance <= 0 ? 'Paid' : 'Partially Paid';
        }

        // Update the invoice document
        batch.update('invoices', invoice.id, {
            amountPaid: newAmountPaid,
            balance: newBalance,
            status: newStatus,
        });

        // If there was an overpayment, update student's credit balance
        if (overpayment > 0) {
            const studentDocs = await dbService.getDocs<Student>('students', [{ type: 'where', fieldPath: 'studentId', opStr: '==', value: invoice.studentId }]);
            if (studentDocs.length > 0) {
                const student = studentDocs[0];
                const currentCredit = student.creditBalance || 0;
                const newCreditBalance = currentCredit + overpayment;
                batch.update('students', student.id, { creditBalance: newCreditBalance });
            }
        }
        
        const accountantDoc = await dbService.getDoc<MockUser>('users', userId);

        const newPayment: Omit<Payment, 'id'> = {
            invoiceId: invoice.invoiceId,
            studentId: invoice.studentId,
            studentName: invoice.studentName,
            amountPaid,
            paymentDate: Timestamp.fromDate(paymentDate),
            paymentMethod,
            recordedBy: userId,
            recordedByName: accountantDoc?.name || 'N/A',
            notes,
            createdAt: serverTimestamp(),
        };

        batch.set('payments', null, newPayment);
        
        await batch.commit();

        revalidatePath('/dashboard/accountant/payments');
        revalidatePath('/dashboard/accountant/invoices');

        return { success: true };

    } catch (error: any) {
        console.error('Error recording payment:', error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}
