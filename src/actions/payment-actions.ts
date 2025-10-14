
'use server';

import { z } from 'zod';
import { dbService } from '@/lib/firebase';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Invoice, Payment, MockUser } from '@/lib/schema';
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

        // 1. Fetch the invoice by its main document ID
        const invoices = await dbService.getDocs<Invoice>('invoices', [{ type: 'where', fieldPath: 'invoiceId', opStr: '==', value: invoiceId }]);
        if (invoices.length === 0) {
            return { error: 'Invoice not found.' };
        }
        const invoice = invoices[0];
        
        // 2. Validate payment
        if (invoice.status === 'Paid') {
            return { error: 'This invoice has already been fully paid.' };
        }
        if (amountPaid > invoice.balance) {
            return { error: `Payment of NGN ${amountPaid.toLocaleString()} exceeds the balance of NGN ${invoice.balance.toLocaleString()}.` };
        }
        
        // 3. Prepare updates for batch
        const batch = dbService.createBatch();
        const newBalance = invoice.balance - amountPaid;
        const newAmountPaid = invoice.amountPaid + amountPaid;
        let newStatus: Invoice['status'] = 'Partially Paid';
        if (newBalance <= 0) {
            newStatus = 'Paid';
        }

        // 4. Update the invoice document
        batch.update('invoices', invoice.id, {
            amountPaid: newAmountPaid,
            balance: newBalance,
            status: newStatus,
        });
        
        // 5. Create a new payment record for auditing
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
        
        // 6. Commit the batch
        await batch.commit();

        revalidatePath('/dashboard/accountant/payments');
        revalidatePath('/dashboard/accountant/invoices');

        return { success: true };

    } catch (error: any) {
        console.error('Error recording payment:', error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}
