
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
        let successMessage = `Payment of NGN ${amountPaid.toLocaleString()} for ${invoice.studentName} has been recorded.`;

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

                successMessage += ` An overpayment of NGN ${overpayment.toLocaleString()} has been added to the student's credit balance.`;
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

        return { success: true, message: successMessage };

    } catch (error: any) {
        console.error('Error recording payment:', error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}

export async function deletePayment(paymentId: string) {
    try {
        const payment = await dbService.getDoc<Payment>('payments', paymentId);
        if (!payment) {
            throw new Error('Payment record not found.');
        }

        const invoices = await dbService.getDocs<Invoice>('invoices', [
            { type: 'where', fieldPath: 'invoiceId', opStr: '==', value: payment.invoiceId },
            { type: 'limit', limitCount: 1 }
        ]);
        const invoice = invoices[0];
        if (!invoice) {
            // If invoice is not found, we can't reverse the transaction, but we can still delete the payment.
            await dbService.deleteDoc('payments', paymentId);
            revalidatePath('/dashboard/accountant/payments');
            return { success: true, message: 'Payment deleted, but could not find the associated invoice to update.' };
        }

        const batch = dbService.createBatch();

        // Reverse the amount paid on the invoice
        const newAmountPaid = invoice.amountPaid - payment.amountPaid;
        const newBalance = invoice.balance + payment.amountPaid;
        let newStatus: Invoice['status'] = 'Unpaid';
        
        if (newAmountPaid > 0) {
            newStatus = 'Partially Paid';
        } else {
            newStatus = 'Unpaid';
        }
        
        // Handle case where balance might exceed totalAmount (e.g., credit scenarios)
        const finalBalance = Math.min(newBalance, invoice.totalAmount);
        const overpaymentReversal = newBalance - finalBalance;
        
        batch.update('invoices', invoice.id, {
            amountPaid: newAmountPaid,
            balance: finalBalance,
            status: newStatus,
        });
        
        // If there was an overpayment to reverse
        if (overpaymentReversal > 0) {
             const studentDocs = await dbService.getDocs<Student>('students', [{ type: 'where', fieldPath: 'studentId', opStr: '==', value: invoice.studentId }]);
            if (studentDocs.length > 0) {
                const student = studentDocs[0];
                const currentCredit = student.creditBalance || 0;
                const newCreditBalance = Math.max(0, currentCredit - overpaymentReversal);
                batch.update('students', student.id, { creditBalance: newCreditBalance });
            }
        }
        
        // Delete the payment record
        batch.delete('payments', paymentId);
        
        await batch.commit();

        revalidatePath('/dashboard/accountant/payments');
        revalidatePath('/dashboard/accountant/invoices');
        
        return { success: true };

    } catch (error: any) {
        console.error('Error deleting payment:', error);
        return { error: error.message || 'An unexpected error occurred while deleting the payment.' };
    }
}
